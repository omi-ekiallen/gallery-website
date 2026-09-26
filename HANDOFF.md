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
| Styling | Tailwind CSS v4 — white background, black text, Cormorant Garamond + Jost |
| Database | SQLite via `node:sqlite`, file-backed at `./data/gallery.db` |
| File storage | Local disk at `./storage/uploads/` |
| ZIP delivery | `archiver`, streamed on demand |
| Auth | HTTP-only signed cookie + bcryptjs |
| Payments | Paystack (test mode until keys are set) |

## Routes

**Studio**
- `/` — landing page
- `/register`, `/login`
- `/dashboard` — galleries, storage, revenue
- `/dashboard/projects/[id]` — upload, cover, passcode, price, delete
- `/dashboard/orders` — client payments and references
- `/dashboard/billing` — storage plan

**Client**
- `/gallery/[slug]` — passcode gate (if set), preview grid, lightbox, paywall bar, checkout
- `/api/gallery/[slug]/download?mediaId=…` or `?all=true` — 403 until the gallery is paid for

## Payments

Paystack is wired end to end; it just needs keys.

- **No keys in `.env.local` (current state):** the checkout runs in test mode. The order is
  recorded, no card is charged, and the gallery unlocks immediately so the whole flow can be
  tested.
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
npm.cmd run test:e2e      # full flow against a running dev server (register → upload → pay → ZIP)
npm.cmd run test:backend  # database, hashing and quota checks
npm.cmd run data:reset    # wipes ./data and ./storage/uploads — no undo
```

## Known gaps

- Previews are served from the original file, so a determined client can save a full-resolution
  image from the grid without paying. Generating downscaled or watermarked previews at upload time
  is the fix.
- Subscription billing, email notifications, expiring links and cloud storage drivers are not built.
