-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Race status enum
create type race_status as enum ('upcoming', 'open', 'closed', 'finished');

-- Races table
create table if not exists races (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status race_status not null default 'upcoming',
  created_at timestamptz not null default now()
);

-- Runners table
create table if not exists runners (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references races(id) on delete cascade,
  name text not null,
  starting_odds numeric not null default 2.0,
  current_odds numeric not null default 2.0,
  created_at timestamptz not null default now()
);

create index if not exists runners_race_id_idx on runners(race_id);

-- Bets table
create table if not exists bets (
  id uuid primary key default gen_random_uuid(),
  runner_id uuid not null references runners(id) on delete cascade,
  race_id uuid not null references races(id) on delete cascade,
  bettor_name text not null,
  amount numeric not null check (amount > 0),
  odds_at_time_of_bet numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists bets_race_id_idx on bets(race_id);
create index if not exists bets_runner_id_idx on bets(runner_id);

-- Function to recalculate odds for all runners in a race
create or replace function recalculate_odds(p_race_id uuid)
returns void
language plpgsql
as $$
declare
  v_total_pool numeric;
  v_runner_bets numeric;
  v_house_take numeric := 0.10; -- 10% house take
  r record;
begin
  -- Calculate total pool for the race
  select coalesce(sum(amount), 0)
  into v_total_pool
  from bets
  where race_id = p_race_id;

  -- If no bets, reset to starting_odds
  if v_total_pool = 0 then
    update runners
    set current_odds = starting_odds
    where race_id = p_race_id;
    return;
  end if;

  -- Update each runner's current_odds
  for r in select id from runners where race_id = p_race_id loop
    select coalesce(sum(amount), 0)
    into v_runner_bets
    from bets
    where runner_id = r.id;

    if v_runner_bets = 0 then
      -- No bets on this runner, use starting_odds
      update runners
      set current_odds = starting_odds
      where id = r.id;
    else
      -- Pari-mutuel odds with house take
      -- odds = (total_pool * (1 - house_take)) / runner_bets
      update runners
      set current_odds = round((v_total_pool * (1 - v_house_take)) / v_runner_bets, 2)
      where id = r.id;
    end if;
  end loop;
end;
$$;

-- Trigger function that calls recalculate_odds after each bet insert
-- security definer so it runs with owner privileges and can update runners (bypasses RLS)
create or replace function trigger_recalculate_odds()
returns trigger
language plpgsql
security definer
as $$
begin
  perform recalculate_odds(NEW.race_id);
  return NEW;
end;
$$;

-- Trigger on bets table
drop trigger if exists after_bet_insert on bets;
create trigger after_bet_insert
  after insert on bets
  for each row
  execute function trigger_recalculate_odds();

-- Enable Row Level Security (public read, service role write)
alter table races enable row level security;
alter table runners enable row level security;
alter table bets enable row level security;

-- Public read policies
create policy "Public can read races" on races for select using (true);
create policy "Public can read runners" on runners for select using (true);
create policy "Public can read bets" on bets for select using (true);

-- Anon insert policy for bets (public betting)
create policy "Public can insert bets" on bets for insert with check (true);

-- Service role has full access (bypasses RLS by default)
