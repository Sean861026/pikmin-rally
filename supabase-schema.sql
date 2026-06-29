-- 建立蘑菇揪人活動表
create table mushroom_events (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null,
  lng double precision not null,
  mushroom_level int not null check (mushroom_level between 1 and 5),
  scheduled_at timestamptz not null,
  max_players int not null default 5,
  note text,
  creator_nickname text not null,
  status text not null default 'open' check (status in ('open', 'full', 'done')),
  created_at timestamptz default now()
);

-- 建立加入記錄表
create table event_joins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references mushroom_events(id) on delete cascade,
  player_nickname text not null,
  joined_at timestamptz default now()
);

-- 開放匿名讀寫（免登入使用）
alter table mushroom_events enable row level security;
alter table event_joins enable row level security;

create policy "anyone can read events" on mushroom_events for select using (true);
create policy "anyone can create events" on mushroom_events for insert with check (true);
create policy "anyone can update events" on mushroom_events for update using (true);

create policy "anyone can read joins" on event_joins for select using (true);
create policy "anyone can join" on event_joins for insert with check (true);
