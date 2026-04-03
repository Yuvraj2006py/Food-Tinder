-- Food Tinder — Phase 2 schema
-- Aligns with: index foreign keys (schema-foreign-key-indexes), RLS enabled (security-rls-basics),
-- wrap auth calls in subqueries where applicable (security-rls-performance).
--
-- Security note: policies below allow the anon role full CRUD on these tables. Session codes
-- provide casual privacy only. Tighten before production (e.g. Supabase Auth + auth.uid()).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.sessions (
  id text primary key,
  city text not null,
  cuisine text,
  created_at timestamptz not null default now(),
  user1_name text,
  user2_name text,
  status text not null default 'waiting',
  constraint sessions_status_check check (status in ('waiting', 'active', 'done'))
);

comment on table public.sessions is 'One row per shared swipe room (session code = id).';

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (id) on delete cascade,
  osm_id text,
  name text,
  cuisine text,
  address text,
  lat double precision,
  lng double precision,
  card_order integer not null
);

comment on table public.restaurants is 'Deck of places for a session; seeded once, same order for both users.';

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_slot text not null,
  vote text not null,
  created_at timestamptz not null default now(),
  constraint votes_user_slot_check check (user_slot in ('user1', 'user2')),
  constraint votes_vote_check check (vote in ('yes', 'no')),
  constraint votes_session_restaurant_user_slot_uq unique (session_id, restaurant_id, user_slot)
);

comment on table public.votes is 'One row per user per restaurant vote.';

-- ---------------------------------------------------------------------------
-- Indexes (FK columns + session-scoped queries)
-- ---------------------------------------------------------------------------

create index restaurants_session_id_idx on public.restaurants (session_id);
create index restaurants_session_card_order_idx on public.restaurants (session_id, card_order);

create index votes_session_id_idx on public.votes (session_id);
create index votes_restaurant_id_idx on public.votes (restaurant_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.sessions enable row level security;
alter table public.restaurants enable row level security;
alter table public.votes enable row level security;

-- Anon key (browser client): policies apply only to role "anon" (JWT from anon key).
-- Scope is enforced by TO anon; authenticated users get no policy here until you add one.
create policy sessions_anon_all
  on public.sessions
  for all
  to anon
  using (true)
  with check (true);

create policy restaurants_anon_all
  on public.restaurants
  for all
  to anon
  using (true)
  with check (true);

create policy votes_anon_all
  on public.votes
  for all
  to anon
  using (true)
  with check (true);

-- Authenticated role: reserved for future (e.g. signed-in users); deny by default until policies added.
-- Service role bypasses RLS for admin/migrations.

-- ---------------------------------------------------------------------------
-- Realtime (postgres_changes subscriptions)
-- ---------------------------------------------------------------------------

alter table public.sessions replica identity full;
alter table public.restaurants replica identity full;
alter table public.votes replica identity full;

alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.restaurants;
alter publication supabase_realtime add table public.votes;
