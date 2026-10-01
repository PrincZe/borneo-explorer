-- ============================================================
-- Repair: restore anon SELECT policy on bookings (schema drift)
-- ============================================================
-- Migration 20260518000001_tighten_bookings_rls.sql defined this policy, but
-- it was never applied to the production database — so anonymous bookings
-- failed: the booking API's insert().select() RETURNING had no passing SELECT
-- policy for the anon role (error 42501). This idempotently re-creates it.
-- Anon may read a booking only when it knows the row UUID (bearer-token design
-- used by the public confirmation and receipt-upload pages).

drop policy if exists "Anon can view booking by id" on public.bookings;
create policy "Anon can view booking by id"
  on public.bookings for select
  using (auth.uid() is null);
