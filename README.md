# Artiklt

pnpm workspaces monorepo for the Artiklt reading-habit app.

## Structure

```
apps/mobile    Expo (React Native) client — @artiklt/mobile
apps/backend   Express + Node + TypeScript API — @artiklt/backend
packages/      Shared packages (empty for now)
```

## Setup

Requires [pnpm](https://pnpm.io) 10+.

```bash
pnpm install
```

## Develop

```bash
pnpm dev             # Expo + Express in parallel
pnpm mobile          # Expo only
pnpm backend         # Express only (:3000)
```

Backend needs `apps/backend/.env` (see `.env.example`) and Postgres. Then:

```bash
pnpm backend:db:push
```

Health check: `GET http://localhost:3000/health` · Auth: `/api/auth/*`

See `prd.md` for product requirements and `AGENTS.md` for contributor/agent conventions.
