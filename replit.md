# Election Integrity Dashboard MVP

## Overview

A full-stack electoral record audit dashboard. Users upload acta images, which are hashed with SHA256, analyzed via OCR, and stored in an immutable blockchain-style ledger backed by PostgreSQL.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **File uploads**: multer
- **OCR**: tesseract.js
- **Blockchain**: SHA256 chaining (crypto node module)

## Architecture

- **Frontend** (`artifacts/election-dashboard`): React + Vite app served at `/`
- **Backend** (`artifacts/api-server`): Express 5 API server at `/api`
- **DB Schema** (`lib/db/src/schema/actas.ts`): `actas` table with blockchain fields
- **Uploads**: stored at `artifacts/api-server/uploads/`

## Key Features

1. **Upload Acta** — POST multipart/form-data to `/api/actas/upload` with `mesa_id` + image
2. **OCR Analysis** — tesseract.js extracts text from uploaded images
3. **SHA256 Hashing** — image content hashed; block_hash chains prev_hash + image_hash + timestamp
4. **Anomaly Detection** — classifies actas as valid/suspicious/inconsistent based on OCR quality
5. **Dashboard** — real-time stats and recent activity feed
6. **Registered Actas** — full list with image preview, OCR result, status badge, detail view
7. **Blockchain Verify** — cryptographic integrity check of entire ledger chain

## API Endpoints

- `GET /api/actas` — list all actas
- `GET /api/actas/:id` — get single acta detail
- `GET /api/actas/:id/image` — serve uploaded image file
- `POST /api/actas/upload` — upload acta (multipart/form-data: mesa_id + image)
- `GET /api/dashboard/stats` — stats by status
- `GET /api/blockchain/verify` — verify chain integrity
- `GET /api/blockchain/blocks` — list all blocks

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Frontend Pages

- `/` or `/dashboard` — Dashboard with stats cards and recent actas table
- `/upload` — Upload form with image drag-and-drop / file picker
- `/actas` — All registered actas with filters and detail links
- `/actas/:id` — Full acta detail with image preview, OCR result, hash display
- `/blockchain` — Chain integrity status + block list

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
