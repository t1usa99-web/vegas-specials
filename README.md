# Vegas Specials

The authoritative, always-fresh source for Las Vegas specials — happy hour, food, drink, freebies, and (soon) gaming, pools, shows, sports. Moat = **freshness + trust**, fed by scraping, crowdsourcing, and a machine-vision photo pipeline.

This repo is the MVP: a Next.js (App Router, PWA-ready) app on Postgres, deployable to Railway, with a working `/api/extract` endpoint that turns a menu photo into structured, confidence-scored specials via Claude vision.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Postgres** (`pg`) — graceful seed-data fallback when no DB attached
- **Claude vision** (`@anthropic-ai/sdk`) for photo → Special extraction
- Deploy: **GitHub → Railway** (auto-deploy on push), Cloudflare in front

## Run locally
```bash
npm install
cp .env.example .env        # optional: add DATABASE_URL + ANTHROPIC_API_KEY
npm run dev                 # http://localhost:3000
```
Runs on seed data + mock extractor with zero config.

## Database
```bash
DATABASE_URL=postgres://... npm run seed   # creates tables + loads 10 venues
```

## Key routes
- `/` — "specials near you" view (filters, confidence + freshness badges, photo demo)
- `POST /api/extract` — photo → structured specials. Body: `{ "mock": true }` or `{ "imageBase64": "...", "mediaType": "image/jpeg", "exif": {...}, "submitter": {...} }`
- `GET /api/specials` — all live specials as JSON

## Deploy to Railway
1. Push this repo to GitHub.
2. Railway → New Project → Deploy from GitHub repo → pick this repo.
3. Add the **Postgres** plugin (sets `DATABASE_URL` automatically).
4. Add env var `ANTHROPIC_API_KEY` for live vision (omit to stay in mock mode).
5. Railway builds via Nixpacks and runs `npm start`. After first deploy, run the seed once (Railway shell): `npm run seed`.
6. Point Cloudflare DNS at the Railway domain.

## How the extraction works
`lib/extract.ts`: vision prompt + strict JSON schema → `validate()` → `scoreConfidence()` (model legibility + EXIF GPS/timestamp + submitter reputation) → `dedupe()` (repeat photos raise trust). Score ≥80 auto-publishes; otherwise routes to review.

## Roadmap
Scrapers (Firecrawl/Apify) · social monitoring · crowd submissions + moderation · events object (shows/sports) · programmatic SEO pages.
