# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps — install all workspace dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-slim AS deps
WORKDIR /app

RUN npm install -g pnpm@9

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/db/package.json            ./lib/db/
COPY lib/api-zod/package.json       ./lib/api-zod/
COPY lib/api-client/package.json    ./lib/api-client/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/

RUN pnpm install --frozen-lockfile --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: build — compile API server
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY lib/           ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

RUN pnpm --filter @workspace/api-server run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: frontend-build — build the React/Vite SPA
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-slim AS frontend-builder
WORKDIR /app

RUN npm install -g pnpm@9

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/api-zod/package.json            ./lib/api-zod/
COPY lib/api-client/package.json         ./lib/api-client/
COPY lib/api-client-react/package.json   ./lib/api-client-react/
COPY artifacts/election-dashboard/package.json ./artifacts/election-dashboard/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY lib/                    ./lib/
COPY artifacts/election-dashboard/ ./artifacts/election-dashboard/

RUN pnpm --filter @workspace/election-dashboard run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: api-runner — minimal production image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-slim AS api

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm install -g pnpm@9

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/db/package.json             ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/lib/db                     ./lib/db

# Static frontend files (served via Express when SERVE_STATIC=true)
COPY --from=frontend-builder /app/artifacts/election-dashboard/dist \
     ./artifacts/election-dashboard/dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
