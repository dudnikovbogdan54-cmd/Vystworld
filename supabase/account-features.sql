-- VystWorld account customization and login audit.
-- Run in Supabase Dashboard -> SQL Editor after schema.sql.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 24),
  avatar text not null default 'creeper',
  theme text not null default 'green' check (theme in ('green','blue','purple','orange')),
  updated_at timestamptz not null default now()
);

-- Preset avatars are stable IDs. Uploaded photos are stored as
-- <user-uuid>/<file-uuid>.<extension> inside the profile-avatars bucket.
alter table public.profiles drop constraint if exists profiles_avatar_check;

-- Migrate legacy public URLs from the previous profile editor to storage paths.
update public.profiles
set avatar = regexp_replace(
  avatar,
  '^https://ywtysiovuvzucfxopusj\.supabase\.co/storage/v1/object/public/profile-avatars/',
  ''
)
where avatar like 'https://ywtysiovuvzucfxopusj.supabase.co/storage/v1/object/public/profile-avatars/%';

update public.profiles
set avatar = 'creeper'
where avatar not in ('creeper','miner','wolf','dragon','king','diamond','mage','warrior')
  and avatar !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$';

alter table public.profiles alter column avatar set default 'creeper';
alter table public.profiles add constraint profiles_avatar_check
  check (
    avatar in ('creeper','miner','wolf','dragon','king','diamond','mage','warrior')
    or avatar ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  );

alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Profile pictures are public display assets. Uploads remain restricted to
-- the authenticated user's own UUID folder and to the allowed image types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own profile avatar" on storage.objects;
create policy "Users can upload own profile avatar"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

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
