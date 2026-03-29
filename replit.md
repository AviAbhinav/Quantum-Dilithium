# Q-Chain — Quantum-Resistant Blockchain

## Overview

pnpm workspace monorepo with a full-stack quantum-resistant blockchain app.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (`build.mjs`, CJS/ESM bundle)
- **Post-quantum crypto**: `dilithium-crystals-js` (Dilithium3/ML-DSA-65)
- **Hashing**: SHA3-512 (block hashes), SHA256 (public key fingerprints)
- **Encryption**: AES-256-GCM (transaction data)
- **Frontend**: React + Vite, TailwindCSS, React Query (cyberpunk theme)

## Architecture

```
artifacts/
  api-server/         — Express backend (port via $PORT)
  quantum-blockchain/ — React + Vite frontend
lib/
  api-spec/           — OpenAPI spec (openapi.yaml)
  api-client-react/   — Orval-generated React Query hooks + customFetch (credentials: include)
  db/                 — Drizzle ORM schema + migrations
```

## Key Design Decisions

### Public Key Storage Fix
Dilithium3 public keys are 1760 bytes (3520 hex chars), exceeding PostgreSQL B-tree index limits (2704 bytes). Solution:
- `users.public_key` — full key stored as TEXT (no unique constraint)
- `users.public_key_hash` — SHA-256 fingerprint with UNIQUE index
- All user lookups by public key use `hashPublicKey()` helper to query by fingerprint

### Post-Quantum Cryptography
- Algorithm: CRYSTALS-Dilithium3 (ML-DSA-65) via `dilithium-crystals-js`
  - Note: Library only supports kind=2 and kind=3; kind=5 unavailable
- `dilithium-crystals-js` externalized in esbuild (requires WASM at runtime)
- Keys auto-generated on registration, private key stored encrypted in DB

### Authentication
- Session-based auth with `express-session` + PostgreSQL session store
- `SESSION_SECRET` secret required (stored in Replit Secrets)
- `bcrypt` (12 rounds) for password hashing, installed with `--ignore-scripts`
- `credentials: "include"` on all frontend API calls

### Blockchain
- Proof-of-Work (difficulty=3, SHA3-512 hashing)
- Genesis block auto-created on first startup
- Mining reward: 10 QDLT
- Starting balance: 100 QDLT per new user
- Transactions signed with Dilithium3, payload AES-256-GCM encrypted

## Database Tables

- `users` — id, username, password_hash, public_key, public_key_hash, private_key, balance
- `blocks` — id, index, hash, previous_hash, nonce, miner, timestamp, transactions (JSONB)
- `pending_transactions` — id, sender, recipient, amount, signature, timestamp

## Environment Secrets

- `SESSION_SECRET` — Express session signing key (required)
- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
