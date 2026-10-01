-- ============================================================
-- Auto-link bookings to their departure (SECURITY DEFINER trigger)
-- ============================================================
-- The booking API runs as the anonymous role for public bookings, which
-- cannot write to the admin-only `departures` table under RLS. Rather than
-- open up that table, a BEFORE INSERT trigger on bookings creates/finds the
-- matching departure and stamps departure_id. SECURITY DEFINER lets it run
-- with owner privileges, bypassing RLS for this controlled path only.

create or replace function public.link_booking_departure()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pkg record;
  dep_id uuid;
begin
  -- Only for fixed-weekday packages with a check-in date
  if new.package_id is null or new.check_in_date is null then
    return new;
  end if;

  select checkin_weekday, default_min_pax into pkg
  from public.packages where id = new.package_id;

  if pkg.checkin_weekday is null then
    return new;  -- legacy / non-scheduled package
  end if;

  -- Find or create the departure for this package + date
  insert into public.departures (package_id, departure_date, min_pax)
  values (new.package_id, new.check_in_date, coalesce(pkg.default_min_pax, 0))
  on conflict (package_id, departure_date) do nothing;

  select id into dep_id
  from public.departures
  where package_id = new.package_id and departure_date = new.check_in_date;

  new.departure_id := dep_id;
  return new;
end;
$$;

drop trigger if exists link_booking_departure_trigger on public.bookings;
create trigger link_booking_departure_trigger
  before insert on public.bookings
  for each row execute function public.link_booking_departure();
