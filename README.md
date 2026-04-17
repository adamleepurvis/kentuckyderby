# RaceBet

A live race betting web app built with Next.js (App Router), Supabase, and Tailwind CSS.

## Features

- Public race listing with status badges
- Real-time odds updates via Supabase Realtime
- Pari-mutuel dynamic odds with configurable house take (10% default)
- Bet confirmation with locked-in odds and potential payout
- Admin panel (password-protected, no auth library) to create/manage races, runners, and view bets
- SQL migration files for all tables, indexes, and odds-recalculation trigger

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your project URL and API keys.

### 2. Run the migration

In your Supabase project, go to **SQL Editor** and run the migration file:

```
supabase/migrations/001_initial_schema.sql
```

This creates the `races`, `runners`, and `bets` tables, all indexes, and the `recalculate_odds` trigger function.

Alternatively, if you have the Supabase CLI installed:

```bash
supabase db push
```

### 3. Enable Supabase Realtime

In your Supabase project dashboard, go to **Database > Replication** and enable the `runners` table for the `supabase_realtime` publication.

### 4. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin mutations) |
| `ADMIN_PASSWORD` | Password for the `/admin` panel |

### 5. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pages

| Path | Description |
|---|---|
| `/races` | Public list of all races |
| `/races/[id]` | Race detail with live odds and bet form (if open) |
| `/admin` | Admin dashboard (requires login) |
| `/admin/login` | Admin login page |
| `/admin/races/new` | Create a new race with runners |
| `/admin/races/[id]` | Edit race, manage runners, view all bets |

---

## Odds Model

Pari-mutuel style with a 10% house take:

```
total_pool = sum of all bets on the race
runner_odds = (total_pool × 0.90) / bets_on_runner
```

- If no bets exist yet, `current_odds = starting_odds`
- Odds are recalculated automatically via a PostgreSQL trigger on every bet insert
- Admins can also manually trigger recalculation from the admin page

---

## Deployment on Vercel

1. Push this repo to GitHub.
2. Import the repo in [vercel.com](https://vercel.com).
3. Add the four environment variables in **Project Settings > Environment Variables**.
4. Deploy.

Make sure your Supabase migration has been applied before going live.
