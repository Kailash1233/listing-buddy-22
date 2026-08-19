-- Move SECURITY DEFINER routines out of the API-exposed public schema
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

ALTER FUNCTION public.agency_owner_of(uuid) SET SCHEMA app_private;
ALTER FUNCTION public.same_agency(uuid, uuid) SET SCHEMA app_private;
ALTER FUNCTION public.accept_agency_invite() SET SCHEMA app_private;
ALTER FUNCTION public.invite_agency_member(text) SET SCHEMA app_private;
ALTER FUNCTION public.remove_agency_member(uuid) SET SCHEMA app_private;
ALTER FUNCTION public.pending_agency_invite() SET SCHEMA app_private;
ALTER FUNCTION public.publish_property(uuid) SET SCHEMA app_private;

-- keep internal cross-calls resolvable
ALTER FUNCTION app_private.agency_owner_of(uuid) SET search_path TO 'public', 'app_private';
ALTER FUNCTION app_private.same_agency(uuid, uuid) SET search_path TO 'public', 'app_private';
ALTER FUNCTION app_private.accept_agency_invite() SET search_path TO 'public', 'app_private';
ALTER FUNCTION app_private.invite_agency_member(text) SET search_path TO 'public', 'app_private';
ALTER FUNCTION app_private.remove_agency_member(uuid) SET search_path TO 'public', 'app_private';
ALTER FUNCTION app_private.pending_agency_invite() SET search_path TO 'public', 'app_private';
ALTER FUNCTION app_private.publish_property(uuid) SET search_path TO 'public', 'app_private';

REVOKE ALL ON FUNCTION app_private.agency_owner_of(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.same_agency(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.accept_agency_invite() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.invite_agency_member(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.remove_agency_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.pending_agency_invite() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.publish_property(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION app_private.agency_owner_of(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.same_agency(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.accept_agency_invite() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.invite_agency_member(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.remove_agency_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.pending_agency_invite() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.publish_property(uuid) TO authenticated, service_role;

-- Thin SECURITY INVOKER wrappers keep the app's RPC surface working
CREATE OR REPLACE FUNCTION public.accept_agency_invite()
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'public', 'app_private'
AS $$ SELECT app_private.accept_agency_invite() $$;

CREATE OR REPLACE FUNCTION public.invite_agency_member(_email text)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'public', 'app_private'
AS $$ SELECT app_private.invite_agency_member(_email) $$;

CREATE OR REPLACE FUNCTION public.remove_agency_member(_member_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'public', 'app_private'
AS $$ SELECT app_private.remove_agency_member(_member_id) $$;

CREATE OR REPLACE FUNCTION public.pending_agency_invite()
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public', 'app_private'
AS $$ SELECT app_private.pending_agency_invite() $$;

CREATE OR REPLACE FUNCTION public.publish_property(_property_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path TO 'public', 'app_private'
AS $$ SELECT app_private.publish_property(_property_id) $$;

REVOKE ALL ON FUNCTION public.accept_agency_invite() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.invite_agency_member(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_agency_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pending_agency_invite() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.publish_property(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.accept_agency_invite() TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_agency_member(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_agency_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pending_agency_invite() TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_property(uuid) TO authenticated;