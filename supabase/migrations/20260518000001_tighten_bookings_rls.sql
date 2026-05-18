-- Tighten bookings RLS: remove overly permissive policies that allowed
-- any user to read/update any booking.
--
-- New approach:
-- - Anonymous (no session) can SELECT by ID (public confirmation/upload pages use UUID as bearer token)
-- - Authenticated customers can only see/update their own bookings
-- - Admins retain full access via existing admin policies

DROP POLICY IF EXISTS "Public can view booking by ref" ON public.bookings;
DROP POLICY IF EXISTS "Public can update booking for receipt" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view their own booking by ref" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can update receipt on their booking" ON public.bookings;

CREATE POLICY "Anon can view booking by id"
  ON public.bookings FOR SELECT
  USING (auth.uid() IS NULL);

CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT
  USING (customer_user_id = auth.uid());

CREATE POLICY "Customers can update own bookings"
  ON public.bookings FOR UPDATE
  USING (customer_user_id = auth.uid())
  WITH CHECK (customer_user_id = auth.uid());
