-- Replace existing packages with Day Trip and 1D1N (prices in MYR)

-- Remove old packages (cascades to room_package_pricing)
delete from public.packages;

-- Insert new packages
insert into public.packages (name, slug, description, duration_days, num_dives, price_per_person, charter_price, features, is_popular, is_active)
values
  (
    'Day Trip',
    'day-trip',
    'A full-day diving trip to Sipadan with 3 dives, perfect for those short on time.',
    1,
    3,
    1300,
    null,
    '["3 guided dives", "Lunch included", "Sipadan permit included", "Marine park fees", "Professional dive guide", "Boat transfers"]',
    false,
    true
  ),
  (
    '1D1N Liveaboard',
    '1d1n-liveaboard',
    'Overnight liveaboard experience with 5 dives including a night dive at Sipadan.',
    2,
    5,
    1500,
    null,
    '["5 guided dives", "All meals included", "1 night accommodation", "Sipadan permit included", "Night dive", "Marine park fees", "Professional dive guide", "Boat transfers"]',
    true,
    true
  );

-- Re-link all rooms to all packages
insert into public.room_package_pricing (room_type_id, package_id, is_available)
select r.id, p.id, true
from public.room_types r, public.packages p
on conflict (room_type_id, package_id) do nothing;
