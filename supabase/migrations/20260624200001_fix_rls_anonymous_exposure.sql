-- SECURITY FIX: Remove RLS policy that exposes ALL bookings to anonymous users.
-- The policy USING (auth.uid() IS NULL) grants full table read to anyone
-- with the public anon key — no row filter applied.
--
-- Confirmation/upload pages now use server-side API endpoints with service role
-- instead of direct client-side Supabase queries.

DROP POLICY IF EXISTS "Anon can view booking by id" ON public.bookings;
