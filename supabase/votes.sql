-- Run in Supabase SQL editor if `votes` is not present yet.
-- Matches plan: UNIQUE (session_id, restaurant_id, user_slot); Realtime enabled on `votes`.

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_slot text not null check (user_slot in ('user1', 'user2')),
  vote text not null check (vote in ('yes', 'no')),
  created_at timestamptz not null default now(),
  unique (session_id, restaurant_id, user_slot)
);

create index if not exists votes_session_id_idx on public.votes (session_id);
create index if not exists votes_restaurant_id_idx on public.votes (restaurant_id);

alter table public.votes enable row level security;

-- MVP: align with permissive anon policies used for sessions/restaurants in dev
drop policy if exists "votes_select_anon" on public.votes;
drop policy if exists "votes_insert_anon" on public.votes;

create policy "votes_select_anon" on public.votes for select using (true);
create policy "votes_insert_anon" on public.votes for insert with check (true);

-- Dashboard → Database → Replication: enable Realtime for `votes` if not already.
-- Phase 11: also enable Realtime for `sessions` so the host sees partner join without refresh.
