-- Update room types to match actual boat layout:
-- 2× Double Bed Cabin (Middle Deck) + 6× Twin Bed Cabin (Lower Deck)

-- Add quantity and deck columns
ALTER TABLE public.room_types ADD COLUMN IF NOT EXISTS quantity int NOT NULL DEFAULT 1;
ALTER TABLE public.room_types ADD COLUMN IF NOT EXISTS deck text;

-- Clear old room types (bookings already detached)
DELETE FROM public.room_package_pricing;
DELETE FROM public.room_types;

-- Insert actual cabin types
INSERT INTO public.room_types (name, slug, description, bed_type, max_occupancy, quantity, deck, is_active)
VALUES
  ('Double Bed Cabin', 'double-bed-cabin', 'Comfortable double bed cabin on the middle deck.', 'Double', 2, 2, 'Middle Deck', true),
  ('Twin Bed Cabin', 'twin-bed-cabin', 'Twin bed cabin on the lower deck.', 'Twin', 2, 6, 'Lower Deck', true);

-- Re-link to packages
INSERT INTO public.room_package_pricing (room_type_id, package_id, is_available)
SELECT r.id, p.id, true
FROM public.room_types r, public.packages p
ON CONFLICT (room_type_id, package_id) DO NOTHING;
