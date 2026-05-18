-- Fix handle_new_user() to assign 'customer' role for self-signups.
-- Previously the trigger ignored raw_user_meta_data->>'role', so every
-- new user got the column default ('ship_worker') and customers could
-- never access /account.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  requested_role text;
BEGIN
  requested_role := new.raw_user_meta_data->>'role';

  IF requested_role = 'customer' THEN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Backfill: fix any customers who signed up before this migration
-- and were incorrectly assigned 'ship_worker'.
UPDATE public.profiles
SET role = 'customer'
WHERE role = 'ship_worker'
  AND id IN (
    SELECT id FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'customer'
  );
