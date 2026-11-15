# Artiklt — Product Requirements Document

## Overview

Artiklt is a mobile-first reading habit app (Expo / React Native). Users build a daily practice of engaging with short articles. Progress is reinforced through streaks and synced to an account so it survives reinstalls and device changes.

**Platform:** iOS, Android (Expo SDK 58). Web is secondary.

---

## Goals (v1)

1. Let users sign in with Google and keep a durable account.
2. Track and display a daily reading streak tied to that account.
3. Make the home experience center on “read today → keep the streak.”

---

## Authentication — Login with Google

### Problem

Without accounts, streaks and reading progress are lost on reinstall and cannot sync across devices.

### Requirements

| ID | Requirement |
| --- | --- |
| AUTH-1 | Users can sign up / sign in with Google from an auth screen. |
| AUTH-2 | Session persists across app restarts until the user signs out. |
| AUTH-3 | Signed-out users can browse content but cannot sync or claim a streak on the server. |
| AUTH-4 | One Google account maps to exactly one Artiklt user. |
| AUTH-5 | On iOS, Sign in with Apple is offered whenever Google (or any third-party) sign-in is offered (App Store guideline). |
| AUTH-6 | Sign-out clears the local session and stops streak sync until the next sign-in. |

### Out of scope (v1)

- Email/password auth
- Magic links / OTP
- Account deletion UI (backend may support later)
- Manual account merge across different Google emails

### UX

- Dedicated auth screen with primary **Continue with Google** CTA.
- On iOS, secondary **Continue with Apple** CTA below Google.
- After success, land on home with streak visible.
- Failed / cancelled sign-in: stay on auth screen with a short error; no partial session.

### Technical approach

- **Backend:** Better Auth with `socialProviders.google` (and Apple for iOS compliance). Accept ID tokens from web, iOS, and Android client IDs.
- **Mobile:** Native Google Sign-In (`@react-native-google-signin/google-signin` or `react-native-nitro-google-signin`), then exchange ID token via Better Auth `signIn.social({ provider: "google", idToken })`.
- Requires a **development build** / EAS build — not Expo Go (native modules + config plugin).
- Store session securely; do not put client secrets in the app.

### Acceptance criteria

- [ ] User can complete Google sign-in on Android and iOS dev builds.
- [ ] Returning user with an existing session opens the app already signed in.
- [ ] Sign-out returns the user to a signed-out state; streak no longer updates on the server until sign-in.
- [ ] Same Google account always resolves to the same user id.
- [ ] iOS build includes Sign in with Apple when Google is enabled.

---

## Streaks

### Problem

Habit apps need a clear, daily signal of consistency. Users should see whether they have “done today” and how long they have kept it up.

### Qualifying action (v1)

A streak day counts when the user **fully opens / completes at least one article** that day (scroll-to-end or explicit “Mark as read” — product should pick one and stick to it). Opening the app alone does **not** count.

### Rules

| Rule | Behavior |
| --- | --- |
| Timezone | User’s device local calendar day. |
| Increment | At most once per calendar day. |
| Continue | Qualifying action yesterday → current streak + 1. |
| Same day | Qualifying action again today → no change. |
| Break | Miss a calendar day → current streak resets to 1 on next qualifying action. |
| Longest | `longest_streak = max(longest_streak, current_streak)` after every update. |
| Freeze / grace | None in v1. |

### Data model (server)

Per authenticated user:

| Field | Type | Notes |
| --- | --- | --- |
| `user_id` | string | PK / FK to auth user |
| `current_streak` | int | ≥ 0 |
| `longest_streak` | int | ≥ 0 |
| `last_qualified_date` | date | `YYYY-MM-DD` in user local TZ at time of write |
| `updated_at` | timestamp | |

Optional later: daily log table for heatmap / history.

### Sync & offline

| ID | Requirement |
| --- | --- |
| STR-1 | Authenticated users sync streak state to the backend after a qualifying action. |
| STR-2 | Local cache may show last-known streak offline; server is source of truth after reconnect. |
| STR-3 | Anonymous / signed-out: streak may be tracked locally only and is **not** merged automatically on first Google login in v1 (show a one-line note that signing in starts a synced streak). |
| STR-4 | Home shows **current streak** prominently; a detail view shows current + longest. |

### UX

- Home: large current streak number + “today done” / “keep it going” state.
- After first qualifying action of the day: brief confirmation (haptic / short copy) that the streak advanced or was maintained.
- Streak detail: current, longest, short explanation of the rules (no freeze in v1).

### Acceptance criteria

- [ ] Completing an article today sets “done for today” and sets or increments streak correctly.
- [ ] Second completion the same day does not double-count.
- [ ] Missing a day then reading again resets current streak to 1 and updates longest if needed.
- [ ] Signed-in user’s streak survives app reinstall after sign-in.
- [ ] Timezone edge: action just before/after local midnight uses the correct calendar day.

---

## Non-goals (v1)

- Social / friend streaks
- Leaderboards
- Streak freezes, repairs, or paid recovery
- Push reminder campaigns beyond a single optional local notification (optional stretch)

---

## Success metrics (early)

- % of installs that complete Google (or Apple) sign-in within day 0–1
- Day-2 and day-7 streak retention (users with current_streak ≥ 2 / ≥ 7)
- % of signed-in users with at least one qualifying action per active day

---

## Open decisions

1. Qualifying action: scroll-to-end vs explicit “Mark as read.”
2. Whether anonymous local streak should ever merge into the account after login (deferred; default = no merge in v1).
3. Optional local notification reminding the user before midnight if today is incomplete.
