# CrashX Portal

Next.js frontend for **CrashX** — crypto crash game UI, wallet flows, profile, VIP, support, and i18n.

Published by [Script.Casino](https://script.casino/). Backend: [**CrashX API**](https://github.com/scriptcasino/free-casino-script-api) (companion repo).

![CrashX — home](docs/crashx-preview.png)

![CrashX — crash game](docs/crashx-crash-game.png)

## Requirements

- Node.js 20+
- Running **CrashX API** (Laravel Sail or your own deploy)

## Install

Start the API first ([API README](https://github.com/scriptcasino/free-casino-script-api#install)), then:

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open **http://localhost:3000** (redirects to `/en`, etc.).

| Variable | Typical local value |
|----------|---------------------|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1` (Sail on port 80; use this if `localhost` stalls on macOS) |
| `NEXT_PUBLIC_PUSHER_*` | Optional — match API `.env` when using Soketi |

Copy from [`.env.local.example`](.env.local.example). Server-side fetches time out after `LARAVEL_FETCH_TIMEOUT_MS` (default 4000 ms).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run dev:webpack` | Dev server (webpack — lighter on some machines) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4
- Radix UI primitives · `next-intl` (9 locales in [`messages/`](messages/))
- Laravel BFF: auth cookie routes under `app/api/auth/*`, Sanctum session, optional Echo via `/api/broadcasting/auth`

## Structure (short)

```text
app/[locale]/     # locale-prefixed routes (next-intl)
components/       # layout, game, profile, ui, seo
lib/              # env (zod), paths, nav, assets, API helpers
messages/         # en, es, de, … UI strings
public/assets/    # images (see lib/assets.ts)
```

Marketing copy: `messages/*.json`. Theme tokens: `app/globals.css` (`@theme`). Tenant theming comes from the API over time.

## Realtime

With Soketi on the API (`COMPOSE_PROFILES=realtime`), set `NEXT_PUBLIC_PUSHER_APP_KEY`, `NEXT_PUBLIC_WS_HOST`, and port `6001` in `.env.local`. Without websockets, the crash page uses a degraded ticker path.

## Docker

[`Dockerfile`](Dockerfile) accepts build-args (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WS_HOST`, …) for production domains.

## Production notes

- Set `NEXT_PUBLIC_SITE_URL` to your public portal origin
- API must allow the portal origin in CORS / Sanctum (`FRONTEND_URL`, etc.)
- Do not commit `.env.local` or `node_modules/`

## License

MIT — [LICENSE](LICENSE). © [Script.Casino](https://script.casino/).
