-- =============================================================================
-- Trips: one row per trip, owned by the user who created it.
--
-- Row Level Security (RLS) makes Postgres itself enforce "each user sees and
-- changes only their own trips", for every request that reaches the database
-- through the Supabase API. Think of the policies below as Angular route
-- guards, except they run in the database and cannot be bypassed by the
-- client: even a hand-crafted request with the publishable key only ever
-- sees the caller's own rows.
-- =============================================================================

create table public.trips (
  id uuid primary key default gen_random_uuid(),

  -- Owner. Defaults to the caller, so the client never sends it; the INSERT
  -- policy below still checks it. Deleting the auth user deletes their trips.
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,

  destination text not null
    constraint trips_destination_not_blank check (length(trim(destination)) > 0),

  start_date date not null,
  end_date date not null,

  -- Total budget in EUR.
  budget numeric(12, 2) not null
    constraint trips_budget_positive check (budget > 0),

  -- Same values as the `INTERESTS` array in src/types/trip.ts.
  interests text[] not null default '{}'
    constraint trips_interests_known check (
      interests <@ array['cultura', 'cibo', 'natura', 'relax', 'nightlife']::text[]
    ),

  created_at timestamptz not null default now(),

  -- Mirrors the client-side validation in TripForm, so the rules hold even
  -- for requests that don't come from our UI.
  constraint trips_dates_ordered check (end_date >= start_date)
);

comment on table public.trips is 'Trips planned by users. Protected by RLS: owner-only access.';

-- Every policy filters on user_id: index it.
create index trips_user_id_idx on public.trips using btree (user_id);

-- -----------------------------------------------------------------------------
-- Access control
-- -----------------------------------------------------------------------------

alter table public.trips enable row level security;

-- Anonymous (signed-out) requests get no access at all; signed-in users get
-- table privileges, narrowed to their own rows by the policies below.
revoke all on table public.trips from anon;
grant select, insert, update, delete on table public.trips to authenticated;

-- One policy per operation, always scoped to the `authenticated` role.
-- `(select auth.uid())` is evaluated once per statement instead of once per
-- row (recommended by Supabase for performance).

create policy "Users can view their own trips"
  on public.trips for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own trips"
  on public.trips for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- `using` picks the rows that can be updated; `with check` prevents moving a
-- row to another user by changing user_id.
create policy "Users can update their own trips"
  on public.trips for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own trips"
  on public.trips for delete
  to authenticated
  using ((select auth.uid()) = user_id);
