DROP POLICY IF EXISTS "Published properties are public" ON public.properties;

CREATE POLICY "Brokers read own properties"
ON public.properties FOR SELECT TO authenticated
USING (auth.uid() = broker_id);

REVOKE ALL ON public.properties FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;