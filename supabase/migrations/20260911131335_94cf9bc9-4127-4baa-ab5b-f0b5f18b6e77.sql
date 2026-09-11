-- Lead enquiries were still insertable directly by anon/authenticated clients
-- (bypassing the app's rate limiting, zod validation and IP throttling in
-- submitLead()). Every other public write path (properties, brokers,
-- track_property_event) was already locked down to go through a service-role
-- server function — bring leads in line with that same pattern.
DROP POLICY IF EXISTS "Anyone can submit an enquiry" ON public.leads;

REVOKE INSERT ON public.leads FROM anon, authenticated;
GRANT ALL ON public.leads TO service_role;
