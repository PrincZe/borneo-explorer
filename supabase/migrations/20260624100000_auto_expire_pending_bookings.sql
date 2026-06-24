-- Auto-expire pending_payment bookings older than 24 hours
-- This releases cabin inventory for other customers

-- Function to expire stale bookings
CREATE OR REPLACE FUNCTION public.expire_stale_bookings()
RETURNS void AS $$
BEGIN
  UPDATE public.bookings
  SET status = 'cancelled',
      admin_notes = COALESCE(admin_notes || E'\n', '') || 'Auto-cancelled: payment not received within 24 hours'
  WHERE status = 'pending_payment'
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule to run every hour via pg_cron (if available)
-- Note: pg_cron must be enabled in Supabase dashboard → Database → Extensions
SELECT cron.schedule(
  'expire-stale-bookings',
  '0 * * * *',
  $$SELECT public.expire_stale_bookings()$$
);
