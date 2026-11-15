This is a pnpm workspaces monorepo for Artiklt.

```
apps/mobile   — Expo / React Native app (@artiklt/mobile)
apps/backend  — Express + Node + TypeScript API (@artiklt/backend)
packages/*    — shared libraries (add as needed)
```

Prioritize mobile-first patterns, performance, and cross-platform compatibility for the Expo app.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `apps/mobile/package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Install from the **repo root** with pnpm:

```bash
pnpm install
```

Run apps via workspace filters (or the root scripts):

```bash
pnpm dev                    # mobile + backend in parallel
pnpm mobile                 # expo start only
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:web
pnpm mobile:lint
pnpm backend                # Express API only (tsx watch)
pnpm backend:build
pnpm backend:start
pnpm backend:typecheck
pnpm backend:db:push        # push Drizzle schema (dev)
pnpm backend:db:generate
pnpm backend:db:migrate
pnpm backend:db:studio
```

Inside `apps/mobile`, use Expo’s installer so SDK versions stay compatible:

```bash
cd apps/mobile
pnpm exec expo install <package>   # ALWAYS use instead of pnpm add for Expo native deps
pnpm exec expo start
pnpm exec expo lint
pnpm exec tsc --noEmit
pnpm exec expo-doctor
pnpm exec expo install --fix
```

Run lint and typecheck before declaring any mobile task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `apps/mobile/src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run from `apps/mobile` as `pnpm exec eas-cli <command>` (or `npx eas-cli@latest <command>`); substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist under `apps/mobile`, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `pnpm exec expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
- Shared code belongs in `packages/*` and is consumed via `"workspace:*"` dependencies.
- Backend lives in `apps/backend` (Express + TypeScript, ESM). Prefer route modules under `src/` and keep secrets in env vars — never commit `.env`.
