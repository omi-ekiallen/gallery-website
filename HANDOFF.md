# PayGallery — Client photo delivery with a paywall

Photographers upload a shoot, share one private link, and the client pays before the
full-resolution files unlock.

Upload → Share → Client pays → Client downloads

## Running it

```powershell
cd C:\Users\DELL\.gemini\antigravity\scratch\gallery-paywall
npm.cmd run dev
```

Then open http://localhost:3000 and create your studio account at `/register`.
There are no demo accounts and no seeded galleries — everything you see is data you created.

Production:

```powershell
npm.cmd run build
npm.cmd run start
```

## Stack

| Layer | What it uses |
| :--- | :--- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Design system | Editorial Darkroom — paper `#F6F2EC`, ink `#201C1A`, darkroom green `#1F3D2B`, brass `#B08D57`, clay `#B5533C`; Newsreader + Manrope; 0px radius, hairline rules, no shadows |
| Styling | Tailwind CSS v4, tokens and component classes in `app/globals.css` |
| Database | SQLite via `node:sqlite`, file-backed at `./data/gallery.db` |
| File storage | Local disk at `./storage/uploads/`, renderings cached in `./storage/derived/` |
| Image pipeline | `sharp` — downscaled previews and blurred locked frames |
| ZIP delivery | `archiver`, streamed on demand |
| Auth | HTTP-only signed cookie + bcryptjs |
| Payments | Paystack (test mode until keys are set) |

## Routes

**Public**
- `/` — home
- `/how-it-works`, `/for-photographers`, `/pricing`, `/faq`, `/help`
- `/privacy`, `/terms`

**Studio**
- `/register`, `/login`
- `/dashboard` — galleries, capacity band, revenue
- `/dashboard/projects/[id]` — upload, contact sheet, cover, passcode, fee, delete
- `/dashboard/orders` — the ledger of client payments
- `/dashboard/billing` — storage plan

**Client**
- `/[studio]/gallery/[slug]` — passcode gate, contact sheet, lightbox, balance bar, checkout
- `/gallery/[slug]` — old links redirect to the studio-scoped URL
- `/api/studios/[handle]/gallery/[slug]/download?mediaId=…` or `?all=true` — 403 until both gates clear

## What a locked gallery shows

Originals never reach the browser. `/api/media/[filename]` only ever serves a rendering, and
which one depends on who is asking:

| Viewer | Gets |
| :--- | :--- |
| Passcode not entered | Blurred frame — the source is shrunk to 32px, blurred, then enlarged |
| Passcode cleared, gallery unpaid | Blurred frame |
| Open gallery, or one the client paid for | Readable preview, max 1600px |
| The photographer who owns the files | Readable preview |

The passcode screen carries the blurred contact sheet behind it, so a client can see the gallery
is real without being able to read a single frame. Both gates also guard
`/api/gallery/[slug]/download`, which answers 403 until the passcode is cleared **and** the order
has settled. Preview URLs carry the access level (`?v=open`), so frames sharpen the instant a
payment clears instead of waiting on a browser cache.

## Gallery links

Every studio gets a handle, minted from its business name at sign-up and editable under
Capacity → Studio address. Gallery links read:

    your-site.com/ade-visuals/gallery/tolu-and-kemi

Gallery slugs are unique per studio, not globally, so two photographers can both have a
gallery called `wedding`. Handles cannot take a name the app itself uses (`dashboard`,
`pricing`, `privacy`, and so on — see `RESERVED_HANDLES` in `lib/slug.ts`). Links shared
before this change still work: `/gallery/<slug>` redirects to the studio-scoped URL.

Changing a handle breaks links already sent to clients — the UI says so before you save.

## Site copy

The marketing and legal pages take the company name, URLs, support addresses and policy
dates from `lib/site.ts`. Change them there once, not page by page.

## Payments

Paystack is wired end to end; it just needs keys.

- **No keys in `.env.local` (current state):** the checkout runs in test mode. The order is
  recorded, no card is charged, and the frames release immediately so the whole flow can be tested.
- **With `PAYSTACK_SECRET_KEY` set:** the client is redirected to real Paystack checkout and comes
  back to `/gallery/[slug]?reference=…`, where the transaction is verified server-side before
  anything unlocks. A live charge that does not cover the gallery price is rejected, and a network
  failure never falls back to unlocking.

Start with Paystack **test** keys from the dashboard, then swap in live keys.

## Environment (`.env.local`)

```env
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
AUTH_SECRET=change-me-before-deploying
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Plans

| Plan | Price | Storage |
| :--- | :--- | :--- |
| Free Starter | ₦0 | 500 MB |
| Pro Creative | ₦7,500 / month | 15 GB |
| Studio Master | ₦20,000 / month | 100 GB |

Quotas are enforced on upload. Plan switching changes the quota immediately; subscription billing
is not charged yet.

## Scripts

```powershell
npm.cmd run test:e2e      # full flow against a running dev server, including the blur gates
npm.cmd run test:backend  # database, hashing and quota checks
npm.cmd run data:reset    # wipes ./data and ./storage — no undo
```

## Known gaps

- Subscription billing, email notifications, expiring links and cloud storage drivers are not built.
- Blurred and preview renderings are cached on disk under `./storage/derived/`; `data:reset` clears
  them along with everything else.
