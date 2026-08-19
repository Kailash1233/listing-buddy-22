DROP POLICY IF EXISTS "Broker profiles are publicly viewable" ON public.brokers;

CREATE POLICY "Brokers read own profile"
ON public.brokers
FOR SELECT
TO authenticated
USING (auth.uid() = id);

REVOKE ALL ON public.brokers FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.brokers TO authenticated;
GRANT ALL ON public.brokers TO service_role;

REVOKE EXECUTE ON FUNCTION public.track_property_event(uuid, public.event_type) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_property_event(uuid, public.event_type) TO service_role;