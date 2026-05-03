-- Customer accounts: role, booking linkage, loyalty tracking

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['company_admin'::text, 'backend_team'::text, 'ship_worker'::text, 'customer'::text]));

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_customer_user_id ON public.bookings(customer_user_id);

CREATE OR REPLACE FUNCTION public.link_bookings_to_customer()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_email text;
BEGIN
  IF NEW.role != 'customer' THEN
    RETURN NEW;
  END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  IF v_email IS NOT NULL THEN
    UPDATE public.bookings
    SET customer_user_id = NEW.id
    WHERE lower(customer_email) = lower(v_email)
      AND customer_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_bookings_on_customer_signup ON public.profiles;
CREATE TRIGGER link_bookings_on_customer_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_bookings_to_customer();

CREATE OR REPLACE FUNCTION public.set_booking_customer_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    SELECT p.id INTO v_user_id
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'customer';
    IF v_user_id IS NOT NULL THEN
      NEW.customer_user_id := v_user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_booking_customer_on_insert ON public.bookings;
CREATE TRIGGER set_booking_customer_on_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_customer_user_id();

CREATE OR REPLACE VIEW public.customer_loyalty_nights AS
SELECT
  b.customer_user_id,
  COUNT(b.id)::int AS total_bookings,
  COALESCE(SUM(
    CASE
      WHEN b.status = 'confirmed'
           AND b.check_out_date IS NOT NULL
           AND b.check_in_date IS NOT NULL
      THEN (b.check_out_date - b.check_in_date)
      ELSE 0
    END
  ), 0)::int AS confirmed_nights
FROM public.bookings b
WHERE b.customer_user_id IS NOT NULL
GROUP BY b.customer_user_id;

GRANT SELECT ON public.customer_loyalty_nights TO authenticated;
