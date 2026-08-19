REVOKE ALL ON FUNCTION public.notify_new_lead() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_payment_success() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.agency_owner_of(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.same_agency(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.agency_owner_of(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.same_agency(uuid, uuid) TO authenticated, service_role;