# @artiklt/backend

Express + Node + TypeScript API for Artiklt (Postgres + Drizzle + Better Auth).

## Setup

1. Copy env file and fill values:

```bash
cp .env.example .env
```

2. Start Postgres (example):

```bash
docker run --name artiklt-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=artiklt \
  -p 5432:5432 -d postgres:16
```

3. Push / migrate schema:

```bash
pnpm --filter @artiklt/backend db:push
# or: pnpm --filter @artiklt/backend db:generate && pnpm --filter @artiklt/backend db:migrate
```

4. Run:

```bash
pnpm backend
```

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | `tsx watch` |
| `build` / `start` | compile + run `dist/` |
| `db:generate` | Drizzle migration SQL |
| `db:migrate` | apply migrations |
| `db:push` | push schema (dev) |
| `db:studio` | Drizzle Studio |

## Endpoints

- `GET /health`
- `ALL /api/auth/*` — Better Auth (Google social + ID token)
- `GET /api/me` — current session
