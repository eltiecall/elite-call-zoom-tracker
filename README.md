# Elite Call Zoom Tracker

Live multi-user zoom sales performance tracker built with Next.js + Supabase + Vercel.

## What It Does

- **Live real-time updates** — every user sees changes instantly via Supabase real-time subscriptions
- **Unique-account close rate** — each company counts once per rep regardless of how many zoom entries exist
- **Dashboard** — all-time combined performance across all months
- **Monthly tabs** — per-month breakdown with rep cards, charts, zoom log, pipeline, and trends
- **Auto trend analysis** — rule-based insights generated from the data: close rate vs team avg, sat rate flags, stale accounts, proposal gaps, MoM changes
- **Add/Edit/Delete** — any user on any device can update entries live

---

## Deploy in 4 Steps

### Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Sign in → New Project
2. Name it `elite-call-zoom-tracker`, pick a region (US East), set a database password
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** → **New Query** → paste the contents of `SUPABASE_SCHEMA.sql` → click **Run**
5. Go to **Project Settings** → **API**
   - Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2 — Push to GitHub

```bash
cd zoom-tracker
git init
git add .
git commit -m "Initial commit"
gh repo create elite-call-zoom-tracker --public --push --source=.
```

Or manually create a repo on github.com and push.

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
3. Click **Deploy**
4. Done — you'll get a URL like `elite-call-zoom-tracker.vercel.app`

### Step 4 — Load Seed Data

1. Open the live site
2. Click the **⚡ Load Data** button (only appears when database is empty)
3. All 191 March + April entries will seed automatically
4. Button disappears once data is loaded

---

## Claude Code Prompt

Run this in Claude Code to build and deploy:

```
I have a Next.js zoom sales tracker app in the /zoom-tracker folder. 

1. Install dependencies: npm install
2. Make sure it builds without errors: npm run build  
3. If there are TypeScript or import errors, fix them
4. Create a .env.local file from .env.local.example — I'll fill in the Supabase keys
5. Help me push to GitHub and deploy to Vercel

The app uses:
- Next.js 14 App Router
- Supabase for database + real-time subscriptions
- Chart.js for charts
- No external UI libraries (all custom CSS)

Key files:
- app/page.tsx — main page with all tab/view logic
- lib/stats.ts — stats computation + trend analysis engine (no AI, pure data)
- lib/seedData.ts — all 191 March + April zoom entries
- lib/supabase.ts — Supabase client + types
- components/ — MetricCards, RepGrid, Charts, ZoomLog, Pipeline, TrendsPanel, ZoomModal
- SUPABASE_SCHEMA.sql — run this in Supabase SQL editor first

After deploy, the site should:
- Show live data synced across all browsers via Supabase real-time
- Have a Dashboard tab (all-time), monthly tabs (March 2025, April 2025)
- Auto-generate trend insights from the data in the Trends section
- Let any user add/edit/delete entries with changes visible to all users instantly
```

---

## Adding New Months

Click **+ Month** in the tab bar → type the month name (e.g. "May 2025") → entries added to that month appear in both the monthly tab and roll up to the Dashboard automatically.

## Adding New Reps

Open `lib/supabase.ts` and add the rep name to the `REPS` array and `REP_COLORS` / `REP_AVATAR_COLORS` objects.

## Trend Analysis Logic (No AI)

The trend engine in `lib/stats.ts` → `generateTrends()` fires these rules automatically:

| Rule | Threshold | Type |
|---|---|---|
| Close rate vs team avg | ±8% with 3+ unique sat | positive / negative |
| Sat rate vs team avg | ±15% with 5+ total | positive / warning |
| Proposals with zero closes | 4+ proposals, 0 closed | warning |
| High volume, zero closes | 10+ zooms, 0 closed | negative |
| Large unclosed proposal pipeline | $15k+ pending, 0 closed | warning |
| Top revenue rep | Highest closedRevenue | positive |
| MoM zoom volume change | ±20% | positive / negative |
| MoM close rate change | ±5% with 5+ unique sat | positive / warning |
| Stale multi-zoom accounts | 3+ zoom entries, not closed | warning |

All rules recalculate live every time data changes.
