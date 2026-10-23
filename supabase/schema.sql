-- Run this in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  amount numeric(10,2) not null check (amount > 0),
  currency text not null default 'RUB' check (currency = 'RUB'),
  status text not null default 'pending' check (status in ('pending','paid','delivered','cancelled','refunded')),
  minecraft_nick text not null check (char_length(minecraft_nick) between 3 and 16),
  delivery_command text not null,
  payment_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_delivery_idx on public.orders(status, paid_at) where delivered_at is null;

alter table public.orders enable row level security;
drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id);

-- No client insert/update/delete policies: order creation and payment state changes
-- must happen server-side with the service-role key.
