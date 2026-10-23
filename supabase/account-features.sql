-- VystWorld account customization and login audit.
-- Run in Supabase Dashboard -> SQL Editor after schema.sql.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 24),
  avatar text not null default '🟩' check (avatar in ('🟩','⛏️','🐺','🐉','👑','💎','🧙','⚔️')),
  theme text not null default 'green' check (theme in ('green','blue','purple','orange')),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table if not exists public.login_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  ip_address text,
  user_agent text,
  event_type text not null default 'login_success' check (event_type = 'login_success'),
  created_at timestamptz not null default now()
);
create index if not exists login_events_created_at_idx on public.login_events(created_at desc);
create index if not exists login_events_user_id_idx on public.login_events(user_id, created_at desc);
alter table public.login_events enable row level security;
-- Intentionally no policies: only server-side service-role requests can read/write this table.
