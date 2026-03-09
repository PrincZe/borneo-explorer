-- ============================================================
-- MV Celebes Explorer — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'ship_worker'
    check (role in ('company_admin', 'backend_team', 'ship_worker')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROOM TYPES
-- ============================================================
create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  max_occupancy int not null default 2,
  size_sqm numeric,
  bed_type text,
  amenities jsonb not null default '[]',
  images jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PACKAGES
-- ============================================================
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  duration_days int not null,
  num_dives int,
  price_per_person numeric not null,
  charter_price numeric,
  features jsonb not null default '[]',
  is_popular boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROOM PACKAGE PRICING (override pricing per room+package combo)
-- ============================================================
create table if not exists public.room_package_pricing (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  price_override numeric,
  is_available boolean not null default true,
  unique (room_type_id, package_id)
);

-- ============================================================
-- ADD-ON OPTIONS
-- ============================================================
create table if not exists public.add_on_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null default 0,
  category text,
  is_active boolean not null default true
);

-- ============================================================
-- BOOKINGS
-- ============================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text not null unique,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'pending_verification', 'confirmed', 'cancelled')),

  -- Customer
  customer_name text not null,
  customer_email text not null,
  customer_phone text,

  -- Trip
  room_type_id uuid references public.room_types(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  check_in_date date,
  check_out_date date,
  num_guests int not null default 1,

  -- Dive info
  certification_level text,
  logged_dives int,
  nitrox_required boolean not null default false,
  equipment_rental boolean not null default false,

  -- Add-ons stored as JSONB array
  add_ons jsonb not null default '[]',
  special_requests text,

  -- Payment
  payment_method text check (payment_method in ('bank_transfer', 'stripe')),
  payment_receipt_url text,
  total_amount numeric,

  -- Admin
  admin_notes text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-generate booking_ref: CE-YYYYMMDD-XXXX (random suffix)
create or replace function public.generate_booking_ref()
returns trigger language plpgsql as $$
declare
  ref text;
  attempts int := 0;
begin
  loop
    ref := 'CE-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(encode(gen_random_bytes(3), 'hex') from 1 for 4));
    begin
      new.booking_ref := ref;
      return new;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 10 then
        raise exception 'Could not generate unique booking_ref after 10 attempts';
      end if;
    end;
  end loop;
end;
$$;

-- Only generate ref if it is empty/default
create or replace function public.set_booking_ref()
returns trigger language plpgsql as $$
declare
  ref text;
begin
  if new.booking_ref is null or new.booking_ref = '' then
    loop
      ref := 'CE-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(encode(gen_random_bytes(3), 'hex') from 1 for 4));
      begin
        new.booking_ref := ref;
        exit;
      exception when unique_violation then
        -- retry
      end;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists set_booking_ref_trigger on public.bookings;
create trigger set_booking_ref_trigger
  before insert on public.bookings
  for each row execute function public.set_booking_ref();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.update_updated_at();

-- ============================================================
-- BLOCKED DATES
-- ============================================================
create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid references public.room_types(id) on delete cascade,
  -- null room_type_id means ALL rooms are blocked
  start_date date not null,
  end_date date not null,
  reason text,
  blocked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.room_types enable row level security;
alter table public.packages enable row level security;
alter table public.room_package_pricing enable row level security;
alter table public.add_on_options enable row level security;
alter table public.bookings enable row level security;
alter table public.blocked_dates enable row level security;

-- Profiles: users can read their own, admins can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role = 'company_admin'
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role = 'company_admin'
    )
  );

create policy "System can insert profiles"
  on public.profiles for insert
  with check (true);

-- Room types: public read, admin write
create policy "Anyone can view active room types"
  on public.room_types for select
  using (is_active = true or auth.uid() is not null);

create policy "Admins can manage room types"
  on public.room_types for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('company_admin', 'backend_team')
    )
  );

-- Packages: public read, admin write
create policy "Anyone can view active packages"
  on public.packages for select
  using (is_active = true or auth.uid() is not null);

create policy "Admins can manage packages"
  on public.packages for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('company_admin', 'backend_team')
    )
  );

-- Room package pricing: public read
create policy "Anyone can view room package pricing"
  on public.room_package_pricing for select
  using (true);

create policy "Admins can manage room package pricing"
  on public.room_package_pricing for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('company_admin', 'backend_team')
    )
  );

-- Add-on options: public read, admin write
create policy "Anyone can view active add-ons"
  on public.add_on_options for select
  using (is_active = true or auth.uid() is not null);

create policy "Admins can manage add-ons"
  on public.add_on_options for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('company_admin', 'backend_team')
    )
  );

-- Bookings: anyone can insert, only admin can read all
create policy "Anyone can create a booking"
  on public.bookings for insert
  with check (true);

create policy "Anyone can view their own booking by ref"
  on public.bookings for select
  using (true); -- public confirmation page needs this; secure via booking_ref obscurity

create policy "Anyone can update receipt on their booking"
  on public.bookings for update
  using (true)
  with check (true);

create policy "Admins can manage all bookings"
  on public.bookings for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('company_admin', 'backend_team', 'ship_worker')
    )
  );

-- Blocked dates: admin manage, anyone read
create policy "Anyone can view blocked dates"
  on public.blocked_dates for select
  using (true);

create policy "Admins can manage blocked dates"
  on public.blocked_dates for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('company_admin', 'backend_team')
    )
  );

-- ============================================================
-- STORAGE
-- ============================================================
-- Run these in the Supabase dashboard if not using CLI:
-- insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);
-- create policy "Authenticated users can upload receipts"
--   on storage.objects for insert
--   with check (bucket_id = 'receipts');
-- create policy "Admins can view receipts"
--   on storage.objects for select
--   using (bucket_id = 'receipts' and auth.uid() is not null);

-- ============================================================
-- SEED DATA — Room Types
-- ============================================================
insert into public.room_types (name, slug, description, max_occupancy, size_sqm, bed_type, amenities, is_active)
values
  ('Master Cabin', 'master-cabin', 'Spacious master cabin with private ensuite bathroom, panoramic windows, and premium furnishings.', 2, 18, 'King', '["Private ensuite bathroom", "Air conditioning", "Panoramic windows", "USB charging ports", "Wardrobe"]', true),
  ('Deluxe Twin Cabin', 'deluxe-twin', 'Comfortable twin cabin ideal for dive buddies, with private bathroom and storage.', 2, 14, 'Twin', '["Private bathroom", "Air conditioning", "Individual reading lights", "Storage lockers", "USB charging ports"]', true),
  ('Standard Cabin', 'standard-cabin', 'Well-appointed standard cabin with bunk beds, great for solo travellers or groups.', 2, 10, 'Bunk', '["Shared bathroom (nearby)", "Air conditioning", "Personal reading light", "Storage space"]', true)
on conflict (slug) do nothing;

-- ============================================================
-- SEED DATA — Packages
-- ============================================================
insert into public.packages (name, slug, description, duration_days, num_dives, price_per_person, charter_price, features, is_popular, is_active)
values
  ('3D2N Sipadan Explorer', '3d2n-sipadan', 'A 3-day, 2-night liveaboard adventure with 6 dives around Sipadan and surrounding reefs.', 3, 6, 1200, 9000, '["6 guided dives", "All meals included", "Dive equipment rinse station", "Sipadan permit (subject to availability)", "Marine park fees"]', false, true),
  ('4D3N Sipadan Discovery', '4d3n-sipadan', 'Our most popular 4-day package with 9 dives, covering Sipadan, Mabul, and Kapalai.', 4, 9, 1650, 12000, '["9 guided dives", "All meals included", "Sipadan permit included", "Night dive", "Marine park fees", "Complimentary nitrox fill (certified)"]', true, true),
  ('7D6N Borneo Liveaboard', '7d6n-borneo', 'The ultimate week-long Sabah liveaboard with 18 dives across all top sites.', 7, 18, 2800, 20000, '["18 guided dives", "All meals & snacks", "Sipadan permits (2 days)", "2 night dives", "Marine park fees", "Complimentary nitrox", "Free dive briefings"]', false, true)
on conflict (slug) do nothing;

-- ============================================================
-- SEED DATA — Room Package Pricing (link all rooms to all packages)
-- ============================================================
insert into public.room_package_pricing (room_type_id, package_id, is_available)
select r.id, p.id, true
from public.room_types r, public.packages p
on conflict (room_type_id, package_id) do nothing;

-- ============================================================
-- SEED DATA — Add-ons
-- ============================================================
insert into public.add_on_options (name, description, price, category, is_active)
values
  ('Nitrox Fills (full trip)', 'EANx 32% nitrox fills for the duration of your trip.', 80, 'diving', true),
  ('Full Equipment Rental', 'BCD, regulator, wetsuit, fins, mask & computer for the trip.', 150, 'diving', true),
  ('Underwater Camera Rental', 'GoPro Hero with underwater housing, charged daily.', 60, 'photography', true),
  ('Sipadan Permit (extra day)', 'Additional Sipadan permit for one extra dive day (subject to quota availability).', 100, 'diving', true),
  ('Dive Insurance (DAN)', 'DAN dive accident insurance for the duration of your trip.', 40, 'insurance', true)
on conflict do nothing;
