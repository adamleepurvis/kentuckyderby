alter table races
  add column if not exists winner_runner_id uuid references runners(id) on delete set null;
