# Happy Little Bug Town

A single-player board game and a demo application for a persisted game API. You dig a hole, feed the bugs that crawl out, and grow a town. Every dig, craft, and move is stored on the server, so the same town can be opened on another device after signing in with Google.

**Play it:** [happy-little-bug-town.vercel.app](https://happy-little-bug-town.vercel.app/)

![Three boards of the same town: first shacks and a hole in the ground, a growing colony, and a grass town with every building](apps/frontend/docs/progression.webp)

## The game

- Digging and crafting items, raising and upgrading buildings and feeding bugs.
- Automation that moves resources by using bugs' skills.
- Stacking items to create new resource sources.
- Evolving the town through new stages.
- Bugs that talk to the player as the game progresses and a quest log that explains the next steps.

You can play anonymously. Signing in with Google attaches that account to the current town. Opening the game on another browser with the same Google account loads that town.

## Stack

- **API:** Node.js, Express 5, Zod, express-rate-limit, google-auth-library
- **Data:** PostgreSQL, Prisma 7 with the `pg` driver adapter
- **Client:** Next.js 14, React 18, Tailwind CSS 4, TanStack Query, Zustand
- **Shared:** TypeScript, Vitest

TanStack Query holds the board (items, bugs, structures, stacks). Zustand holds UI that is not server state: the open dialogue, demolish mode, and the login prompt. Removed entities keep a `removedAt` timestamp so in-flight animations can still refer to them. Lists filter those rows out.

## Layout

npm workspaces, three packages:

| Package | Role |
| --- | --- |
| `apps/frontend` | React, Next.js client. Drag and drop, dialogues, and the board. |
| `apps/backend` | Express REST API with PostgreSQL. Persistence and game actions. |
| `apps/utils` | Shared rules: costs, footprints, feeding, crafting, evolution. |

The frontend is deployed on Vercel. The API and PostgreSQL run on Railway. The browser talks to the API with cookies, so the two origins are configured for credentialed CORS.

```
Browser (Next.js on Vercel)
  |  signed cookies, JSON
  v
Express API (Railway)
  |  Prisma
  v
PostgreSQL
```

`apps/utils` is imported by both sides. The client uses it to reject an illegal drop immediately. The API runs the same checks before it writes.

## API

The game is stored in PostgreSQL as rows owned by one player (`authorId`): items, bugs, structures, stacks, and visited dialogues. Reads are ordinary list endpoints. Writes are either updates (move, attach to a stack or building) or actions that encode a rule:

- `POST /api/structures/:id/dig` rolls the next find for the current ground stage.
- `POST /api/structures/:id/craft` spends inputs already delivered to a building.
- `POST /api/structures/:id/evolve` turns the colony into the next stage.
- `POST /api/structures/:id/demolish` returns one occupant or spent resource to the grid. The building is removed when the last piece leaves.
- `POST /api/grid/swap` exchanges two cells when the rules allow it.
- `GET /api/items` and `GET /api/bugs` list what is currently on the grid.
- `POST /api/items` places a crafted item. The workshop must exist, and the recipe must be unlocked.
- `PUT /api/items/:id` moves an item, or attaches it to a bug, a stack, a building, or another item.
- `DELETE /api/items/:id` discards an item into the hole (`structureId` in the body). The row stays, with `removedAt` set.
- `PUT /api/bugs/:id` moves a bug, or sends it into a building or a stack.
- `DELETE /api/bugs/:id` discards a bug into the hole, under the same soft-delete rule.

Ownership is the signed player cookie. A route that touches one entity loads it and checks that it belongs to that player before the handler runs.

## Auth and abuse controls

Play starts with `POST /api/users/register`, which creates an anonymous user and sets a signed, HTTP-only `aid` cookie. That cookie is the player id for the board (anonymous id).

Google sign-in posts the GIS ID token to `POST /api/auth/google`. The API verifies it with the Google Auth library (audience is the configured client id) and stores `googleSub` on the user. A separate signed session cookie is issued for 30 days. After an account is linked, writes are accepted only when the session user matches the `aid` cookie, so the anonymous cookie alone cannot keep editing a linked town.

Three rate limiters sit in front of that:

- All `/api` routes: 1000 requests per 15 minutes.
- Register, reset, and Google login: 60 requests per 15 minutes.
- Dig, craft, extract, and demolish: 360 requests per minute, keyed by player id.

Zod checks the API environment at startup and exits if the public origin, CORS origin, port, Google client id, or session secret is missing or invalid. The session secret must be at least 16 characters. Request bodies are checked in the handlers with the shared type guards, UUID parsing, and coordinate bounds.

Grid writes that change occupancy (placing an item, moving a structure, swapping cells, and the item transaction that backs those moves) take a PostgreSQL advisory lock for that player inside the transaction:

```sql
SELECT pg_advisory_xact_lock(hashtext(authorId))
```

The lock is held until the transaction commits, so two overlapping requests cannot claim the same cell.

## Trade-offs

**Separate API instead of Next.js route handlers.** The client and the API deploy and scale on their own, and the HTTP surface is the thing this project is meant to show. The cost is CORS, a second process locally, and cross-site cookies (`SameSite=None`, `Secure`, and `Partitioned` in production) because Vercel and Railway are different sites.

**Anonymous first, Google as a save slot.** A new visitor plays immediately. Linking Google reuses the same user row, so the town they already built is the one that syncs. Signing in on a browser that already has a different anonymous town switches that browser to the Google town. The old rows stay in the database under the previous id, but the browser no longer points at them. Towns are not merged.

**Advisory lock per player.** One lock key per town serializes placement without locking the whole database or inventing a row lock for every cell. `hashtext` is 32-bit, so two players can theoretically share a key and queue behind each other. That is acceptable for this game: each player has one board, and a collision only delays a transaction. The lock covers occupancy changes. Some attach and stack updates run in their own transactions without it.

**In-memory rate limits.** express-rate-limit stores counters in the API process. A restart clears them, and a second instance would keep its own counters. That matches a single Railway process. A multi-instance deployment would need a shared store such as Redis.

## Run locally

Requirements: Node.js 20 or newer, npm, and PostgreSQL.

1. Install dependencies. The `utils` package builds itself on install.

   ```bash
   npm install
   ```

2. Create a database and copy the env files.

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

   `apps/backend/.env`:

   ```
   RAILWAY_PUBLIC_DOMAIN=http://localhost
   CORS_ORIGIN=http://localhost:3000
   PORT=4000

   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/happy_little_bug_town

   SESSION_SECRET=at-least-16-characters
   SESSION_TTL_DAYS=30

   # Required at startup. Any non-empty value is enough to boot and play anonymously.
   # Google sign-in needs the real OAuth client id, the same value as in the frontend.
   GOOGLE_CLIENT_ID=
   ```

   `apps/frontend/.env`:

   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

   # same as in backend
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=
   ```

   Use the same Google OAuth client id in both files. In Google Cloud Console, add `http://localhost:3000` as an authorized JavaScript origin. The API verifies the ID token. It does not use a client secret.

3. Apply migrations and start both apps. The API listens on port 4000, the client on port 3000.

   ```bash
   npm run migrate
   npm run dev
   ```

`npm test` runs Vitest in all workspaces.
