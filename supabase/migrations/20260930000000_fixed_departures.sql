-- ============================================================
-- Fixed-Departure Liveaboard + Min-Pax Waitlist
-- ============================================================
-- Moves from free-form date booking to fixed weekly departures:
--   4D3N  — check-in Tuesday (weekday 2), 3 nights
--   5D4N  — check-in Friday  (weekday 5), 4 nights
--   7D6N  — check-in Tuesday (weekday 2), 6 nights
-- All priced flat at RM 1500/pax/night. Departures sail only if a
-- minimum pax threshold is met; otherwise guests transfer to Sipadan
-- by speedboat (nobody is cancelled). Admin confirms transfer mode.

-- ------------------------------------------------------------
-- 1. Extend packages with scheduling columns
-- ------------------------------------------------------------
alter table public.packages
  add column if not exists checkin_weekday int,      -- 0=Sun … 2=Tue … 5=Fri
  add column if not exists nights int,               -- authoritative night count
  add column if not exists default_min_pax int not null default 0;

-- ------------------------------------------------------------
-- 2. Reseed packages — deactivate every existing package, then upsert
--    the three fixed ones (old rows kept, not deleted, so historical
--    bookings' package_id FKs survive). The upsert below re-activates
--    only the three current packages.
-- ------------------------------------------------------------
update public.packages set is_active = false;

insert into public.packages
  (name, slug, description, duration_days, nights, checkin_weekday, num_dives,
   price_per_person, default_min_pax, charter_price, features, is_popular, is_active)
values
  (
    '4D3N Liveaboard', '4d3n-liveaboard',
    '4-day, 3-night Sipadan liveaboard departing every Tuesday. 9 dives across Sipadan, Mabul and Kapalai.',
    4, 3, 2, 9,
    1500, 8, null,
    '["9 guided dives", "All meals included", "3 nights accommodation", "Sipadan permit included", "Night dive", "Marine park fees", "Professional dive guide"]',
    true, true
  ),
  (
    '5D4N Liveaboard', '5d4n-liveaboard',
    '5-day, 4-night Sipadan liveaboard departing every Friday. 12 dives with extended time at Sipadan.',
    5, 4, 5, 12,
    1500, 8, null,
    '["12 guided dives", "All meals included", "4 nights accommodation", "Sipadan permit included", "Night dive", "Marine park fees", "Professional dive guide"]',
    false, true
  ),
  (
    '7D6N Liveaboard', '7d6n-liveaboard',
    'The full week — 7-day, 6-night Sipadan liveaboard departing every Tuesday. 18 dives across all top sites.',
    7, 6, 2, 18,
    1500, 8, null,
    '["18 guided dives", "All meals & snacks", "6 nights accommodation", "Sipadan permits", "2 night dives", "Marine park fees", "Professional dive guide"]',
    false, true
  )
on conflict (slug) do update set
  name             = excluded.name,
  description      = excluded.description,
  duration_days    = excluded.duration_days,
  nights           = excluded.nights,
  checkin_weekday  = excluded.checkin_weekday,
  num_dives        = excluded.num_dives,
  price_per_person = excluded.price_per_person,
  default_min_pax  = excluded.default_min_pax,
  features         = excluded.features,
  is_popular       = excluded.is_popular,
  is_active        = true;

-- Link all rooms to any newly-inserted packages
insert into public.room_package_pricing (room_type_id, package_id, is_available)
select r.id, p.id, true
from public.room_types r, public.packages p
where p.slug in ('4d3n-liveaboard', '5d4n-liveaboard', '7d6n-liveaboard')
on conflict (room_type_id, package_id) do nothing;

-- ------------------------------------------------------------
-- 3. Departures table — first-class unit bookings attach to
-- ------------------------------------------------------------
create table if not exists public.departures (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  departure_date date not null,
  min_pax int not null default 0,
  transfer_mode text check (transfer_mode in ('big_boat', 'speedboat')),  -- null = undecided (waitlist)
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (package_id, departure_date)
);

-- ------------------------------------------------------------
-- 4. Link bookings to a departure (nullable — legacy bookings stay null)
-- ------------------------------------------------------------
alter table public.bookings
  add column if not exists departure_id uuid references public.departures(id) on delete set null;

-- ------------------------------------------------------------
-- 5. Row Level Security — public read, admin write (mirrors blocked_dates)
-- ------------------------------------------------------------
alter table public.departures enable row level security;

drop policy if exists "Anyone can view departures" on public.departures;
create policy "Anyone can view departures"
  on public.departures for select
  using (true);

drop policy if exists "Admins can manage departures" on public.departures;
create policy "Admins can manage departures"
  on public.departures for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('company_admin', 'backend_team')
    )
  );
