-- VystWorld account customization and login audit.
-- Run in Supabase Dashboard -> SQL Editor after schema.sql.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 24),
  avatar text not null default 'creeper',
  theme text not null default 'green' check (theme in ('green','blue','purple','orange')),
  updated_at timestamptz not null default now()
);
-- Migrate older emoji-based avatar values to stable icon IDs.
alter table public.profiles drop constraint if exists profiles_avatar_check;
update public.profiles set avatar = case
  when avatar in ('creeper','miner','wolf','dragon','king','diamond','mage','warrior') then avatar
  else 'creeper'
end;
alter table public.profiles alter column avatar set default 'creeper';
alter table public.profiles add constraint profiles_avatar_check
  check (avatar in ('creeper','miner','wolf','dragon','king','diamond','mage','warrior'));

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

-- Automatically purge login audit entries older than 90 days whenever a new entry is written.
create or replace function public.purge_old_login_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.login_events where created_at < now() - interval '90 days';
  return new;
end;
$$;
drop trigger if exists login_events_retention_trigger on public.login_events;
create trigger login_events_retention_trigger
after insert on public.login_events
for each row execute function public.purge_old_login_events();
