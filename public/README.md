# BazaarPulse v2.0

> Bloomberg Terminal-lite for Indian retail investors.

## Stack
- **Next.js 14** — Pages Router, SSR-ready
- **Tailwind CSS 3** — Utility classes
- **IBM Plex Mono + Space Grotesk** — Terminal aesthetic
- **SWR** — Stale-while-revalidate data fetching
- **Vercel** — Serverless deployment

## Architecture
```
pages/
  index.js          — News Feed (live RSS, priority-scored, categorised)
  macro.js          — India Macro KPIs + RBI timeline
  government.js     — Budget tracker, SEBI actions, Policy news
  warzone.js        — Geopolitical analysis + live feed
  knowledge.js      — 8 financial education topics + glossary
  utilities.js      — SIP, FD, Brokerage, EMI, Lump Sum calculators
  api/
    feed.js         — RSS aggregator proxy (12 sources, cached 5min)
    market.js       — Yahoo Finance proxy (indices + forex, cached 3min)

data/
  sources.json      — All RSS sources (add/remove without code changes)
  categories.json   — CATS keywords, severity thresholds, colours
  macro.json        — India KPI reference data

lib/
  scorer.js         — Article scoring + categorisation + impact generation
```

## Scoring System
Articles scored 0-N using weighted keywords:
- **CRITICAL** (≥12): RBI rate decisions, circuit breakers, budget announcements
- **MAJOR** (≥6): NIFTY moves, corporate earnings, policy announcements
- **MINOR** (<6): Routine market news

Each article gets an auto-generated "Retail Investor Impact" explanation.

## Deploy to Vercel
```bash
git clone https://github.com/akki1947/bazaarpulse
cd bazaarpulse
# Replace all files with v2 contents
npm install
vercel deploy
```

## Add More RSS Sources
Edit `data/sources.json` — no code changes needed.

## Add More Categories
Edit `data/categories.json` — add to `categories[]` array with keywords.

---
Not SEBI registered. Not financial advice. Informational only.
