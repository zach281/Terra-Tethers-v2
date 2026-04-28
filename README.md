# Terra Tethers 🌍

> **Trade the World Stage** — Geopolitical paper trading. Buy/sell country coins tied to real Middle East tensions.

## Quick Start

### 1. Install

```bash
cd terra-tethers
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. SQL Editor → run `supabase/migrations/001_schema.sql`
3. SQL Editor → run `supabase/migrations/002_seed.sql`
4. Auth → Settings → disable "Confirm email" for dev

### 3. Configure env

```bash
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

### 5. Trigger price engine (dev)

```bash
curl -X POST http://localhost:3000/api/price-engine \
  -H "Authorization: Bearer your-cron-secret"
```

---

## Deploy to Vercel

```bash
git init && git add . && git commit -m "Terra Tethers MVP"
# Push to GitHub, then import on vercel.com
# Add all env vars from .env.example
# Set NEXT_PUBLIC_APP_URL to your Vercel URL
```

The `vercel.json` cron calls `/api/price-engine` every minute (requires Pro plan).

**Free alternative — Supabase pg_cron:**
```sql
SELECT cron.schedule('price-tick', '* * * * *', $$
  SELECT net.http_post(
    'https://your-app.vercel.app/api/price-engine',
    '{"Authorization":"Bearer YOUR_SECRET"}'::jsonb
  );
$$);
```

---

## Architecture

```
app/
  page.tsx               # Landing page
  (auth)/login|signup    # Auth pages
  (main)/
    market/              # Live coin trading
    portfolio/           # Holdings + trade history
    news/                # Geopolitical intel feed
    leaderboard/         # Rankings
    profile/             # Achievements + referrals
  api/
    coins/               # Coin prices
    trades/              # Execute trades
    portfolio/           # Portfolio stats
    leaderboard/         # Rankings
    news/                # News feed
    price-engine/        # Cron price updates
    achievements/        # Badge checking
    referrals/           # Referral system
    waitlist/            # Waitlist signup
lib/
  price-engine.ts        # Brownian + volume algorithm
  achievements.ts        # Achievement logic
  types.ts               # All TypeScript types
supabase/migrations/
  001_schema.sql         # Full DB schema + RLS
  002_seed.sql           # Coins, achievements, news
```

## Price Engine Algorithm

Every minute:
1. Fetch recent buy/sell volume per coin
2. Calculate: `price × (1 + volumePressure + sentiment + brownianNoise + meanReversion + eventShock)`
3. Store OHLCV candle in `price_history`
4. Occasionally fire a simulated geopolitical event
5. Update coin sentiment scores

**Anti-manipulation**: $5K max order · 2s cooldown · weighted volume averaging

## Countries

🇺🇸 USA · 🇮🇷 IRN · 🇮🇱 ISR · 🇸🇦 SAU · 🇮🇶 IRQ · 🇸🇾 SYR · 🇾🇪 YEM · 🇱🇧 LBN · 🇦🇪 UAE · 🇶🇦 QTR

All coins start at **$1.00**. Paper trading only — no real money.
