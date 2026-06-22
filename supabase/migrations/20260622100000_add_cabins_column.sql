-- Add cabins JSONB column to store multiple cabin selections per booking
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cabins jsonb DEFAULT '[]';
