# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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
- **Post-quantum crypto**: dilithium-crystals-js (CRYSTALS-Dilithium2 / ML-DSA-44)
- **Frontend**: React + Vite, TailwindCSS, Framer Motion, React Query

## Features

This is a quantum-resistant blockchain using CRYSTALS-Dilithium signatures:

1. **Key Generator** — Generate Dilithium2 key pairs (1472-byte public key, post-quantum secure)
2. **Wallet & Send** — Sign and submit transactions using Dilithium private keys
3. **Blockchain Explorer** — View all blocks and their Dilithium-signed transactions
4. **Mining Pool** — Mine new blocks with proof-of-work (difficulty=3)
5. **Dashboard** — Network stats, chain validation (verifies all Dilithium signatures)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (blockchain + Dilithium routes)
│   └── quantum-blockchain/ # React frontend (dark cyberpunk theme)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in `references`

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with blockchain and Dilithium crypto routes.

Routes:
- `POST /api/keys/generate` — Generate Dilithium2 key pair
- `GET /api/blockchain` — Get full blockchain
- `GET /api/blockchain/validate` — Validate all signatures on chain
- `POST /api/blockchain/mine` — Mine a new block (PoW, difficulty=3)
- `GET /api/transactions/pending` — List pending transactions
- `POST /api/transactions/sign` — Sign a transaction with Dilithium private key
- `POST /api/transactions/submit` — Submit signed transaction (verifies signature)

### `artifacts/quantum-blockchain` (`@workspace/quantum-blockchain`)

React + Vite frontend with dark cyberpunk theme.

### `lib/db` (`@workspace/db`)

Database schema:
- `blocks` — Mined blocks with all transaction data
- `pending_transactions` — Unconfirmed transactions in the mempool

### `lib/api-spec` (`@workspace/api-spec`)

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks from OpenAPI spec.
