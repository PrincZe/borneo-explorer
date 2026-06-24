-- SECURITY FIX: Prevent privilege escalation via signup
-- Previously, the ELSE branch omitted the role field, defaulting to 'ship_worker'
-- which grants admin access. Now ALL self-signups get 'customer' regardless of
-- what the client sends in user_metadata.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- All self-signups are customers. Elevated roles (ship_worker, company_admin)
  -- can only be assigned by an admin updating the profiles table directly.
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer')
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Backfill: fix any users who were accidentally assigned ship_worker via the old trigger
-- but are NOT actual admin users (i.e., they signed up themselves)
-- Preserve existing legitimate admin accounts by only fixing those with 'customer' in metadata
-- or those created after the original migration date
UPDATE public.profiles
SET role = 'customer'
WHERE role = 'ship_worker'
  AND id IN (
    SELECT id FROM auth.users
    WHERE raw_user_meta_data->>'role' IS DISTINCT FROM 'ship_worker'
      AND raw_user_meta_data->>'role' IS DISTINCT FROM 'company_admin'
  );
