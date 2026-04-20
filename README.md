# Sistema de Integridad Electoral — Colombia

> Plataforma de auditoría ciudadana de actas electorales mediante criptografía SHA-256, OCR y un ledger blockchain sobre PostgreSQL.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9C%93-brightgreen)]()
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org)

---

## Qué es

El **Sistema de Integridad Electoral** convierte las actas electorales físicas en registros digitales inmutables. Cada acta que sube un observador recibe:

1. Una **huella SHA-256** de la imagen — si alguien la modifica, el hash cambia
2. **OCR automático** (Tesseract.js) para extraer el texto y clasificar la acta
3. Un **bloque encadenado** al ledger — igual que blockchain, sin criptomonedas
4. **Detección visual multi-modelo** — 4 motores de análisis comparan resultados y generan un score de integridad 0–100

El resultado: cualquier ciudadano puede verificar que ninguna acta fue alterada después de ser registrada.

---

## Capturas de pantalla

| Panel | Subir Actas | Detección Visual | Blockchain |
|-------|------------|-----------------|------------|
| Dashboard con stats en tiempo real | Cola multi-archivo con procesamiento secuencial | Multi-modelo con mapa de confianza visual | Ledger completo con verificación de cadena |

---

## Funciones principales

| Función | Descripción |
|---------|-------------|
| **Carga masiva** | Sube múltiples actas a la vez; se procesan en cola, una por una |
| **Hash SHA-256** | Huella criptográfica inmutable de cada imagen |
| **OCR Tesseract** | Extracción automática de texto y números en español |
| **Blockchain ledger** | Cada bloque depende del anterior; romper uno invalida toda la cadena |
| **Detección multi-modelo** | OCR Rápido + OCR Preciso + CNN + Anomalías → score de integridad |
| **Mapa de confianza** | Overlay visual sobre la imagen con zonas verdes/amarillas/rojas |
| **Filtros geográficos** | Por departamento y municipio (33 departamentos colombianos) |
| **Verificación pública** | Cualquiera puede recalcular y verificar la cadena |
| **Mobile-first** | Diseño para observadores en campo con smartphones |

---

## Stack tecnológico

```
Frontend   React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui
Backend    Express 5 + Node.js 22 + TypeScript 5
Base datos PostgreSQL 16 + Drizzle ORM
OCR        Tesseract.js 7 (corre en el servidor, sin APIs de pago)
Seguridad  SHA-256 nativo (módulo crypto de Node, FIPS 180-4)
Monorepo   pnpm workspaces
Docker     Multi-stage builds + docker-compose
```

---

## Inicio rápido

### Con Docker (recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/TU_ORG/integridad-electoral.git
cd integridad-electoral

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Levantar todo el stack
docker compose up -d

# Correr migraciones (primera vez)
docker compose run --rm migrate

# La app estará disponible en:
# Frontend: http://localhost:3000
# API:      http://localhost:8080
```

### Desarrollo local

**Requisitos:**
- Node.js 22+
- pnpm 9+
- PostgreSQL 16+

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL en .env

# Correr migraciones
pnpm --filter @workspace/db run migrate

# Iniciar en modo desarrollo (ambos servicios)
pnpm --filter @workspace/api-server run dev &
pnpm --filter @workspace/election-dashboard run dev
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz basado en `.env.example`:

```env
# Base de datos
DATABASE_URL=postgres://electoral:changeme@localhost:5432/integridad_electoral
POSTGRES_USER=electoral
POSTGRES_PASSWORD=changeme
POSTGRES_DB=integridad_electoral

# Seguridad
SESSION_SECRET=cambia-esto-en-produccion-con-un-valor-aleatorio-largo

# Servidor
PORT=8080
NODE_ENV=development
```

---

## Estructura del proyecto

```
.
├── artifacts/
│   ├── api-server/          # Backend Express 5
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── actas.ts       # Upload, OCR, blockchain
│   │   │   │   └── detection.ts   # Análisis multi-modelo
│   │   │   └── lib/
│   │   │       └── blockchain.ts  # SHA-256 + encadenamiento
│   │   └── build.mjs              # esbuild bundler
│   │
│   └── election-dashboard/  # Frontend React + Vite
│       └── src/
│           ├── pages/
│           │   ├── dashboard.tsx
│           │   ├── upload.tsx     # Cola multi-archivo
│           │   ├── detection.tsx  # Multi-modelo
│           │   ├── actas.tsx
│           │   ├── blockchain.tsx
│           │   └── blog.tsx
│           └── components/
│
├── lib/
│   ├── db/                  # Schema PostgreSQL + Drizzle
│   ├── api-zod/             # Validación con Zod
│   ├── api-client/          # Cliente HTTP generado
│   └── api-client-react/    # Hooks React Query
│
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── CONTRIBUTING.md
├── MANIFEST.md
├── SECURITY.md
└── LICENSE
```

---

## API Reference

### Actas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/actas/upload` | Subir imagen de acta |
| `GET`  | `/api/actas` | Listar todas las actas |
| `GET`  | `/api/actas/:id` | Detalle de un acta |
| `GET`  | `/api/actas/:id/image` | Imagen original del acta |

### Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/dashboard/stats` | Estadísticas globales |

### Blockchain

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/blockchain/blocks` | Todos los bloques |
| `GET`  | `/api/blockchain/verify` | Verificar integridad de la cadena |

### Detección Visual

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/detection/analyze` | Análisis multi-modelo de imagen |

---

## Cómo contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para el protocolo completo de contribución.

En resumen:
1. Abre un issue describiendo el problema o la mejora
2. Haz fork del repositorio
3. Crea una rama: `git checkout -b feat/nombre-descriptivo`
4. Haz tus cambios con commits convencionales
5. Abre un Pull Request contra `main`

---

## Seguridad

Para reportar vulnerabilidades de seguridad, lee [SECURITY.md](SECURITY.md). No abras issues públicos para reportar vulnerabilidades críticas.

---

## Licencia

[MIT](LICENSE) — 2026 Sistema de Integridad Electoral Colombia

El código es libre. Los datos electorales son del pueblo colombiano.

---

## Contexto y motivación

Colombia tiene ~33 departamentos, ~1.122 municipios y más de 100.000 mesas de votación activas en elecciones presidenciales. Las actas de escrutinio son el documento físico firmado por jurados que certifica los votos de cada mesa.

Este sistema nació de una pregunta simple: **¿cómo puede un ciudadano verificar que el acta que se fotografió es exactamente la misma que llegó al sistema de cómputo?**

La respuesta es criptografía + código abierto.
