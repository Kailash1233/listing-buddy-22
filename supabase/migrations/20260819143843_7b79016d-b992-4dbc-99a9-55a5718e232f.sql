-- 1. RATE LIMITING -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_limit_hits_lookup ON public.rate_limit_hits (bucket, subject, created_at DESC);
GRANT ALL ON public.rate_limit_hits TO service_role;
ALTER TABLE public.rate_limit_hits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.hit_rate_limit(_bucket text, _subject text, _limit integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _count integer;
BEGIN
  DELETE FROM public.rate_limit_hits WHERE created_at < now() - interval '1 day';
  SELECT count(*) INTO _count FROM public.rate_limit_hits
    WHERE bucket = _bucket AND subject = _subject
      AND created_at > now() - make_interval(secs => _window_seconds);
  IF _count >= _limit THEN
    RETURN false;
  END IF;
  INSERT INTO public.rate_limit_hits (bucket, subject) VALUES (_bucket, _subject);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.hit_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(text, text, integer, integer) TO service_role;

-- 2. NOTIFICATIONS WRITTEN BY TRIGGERS ---------------------------------------
CREATE OR REPLACE FUNCTION public.notify_new_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _title text;
BEGIN
  SELECT COALESCE(NULLIF(p.title, ''), 'your listing') INTO _title FROM public.properties p WHERE p.id = NEW.property_id;
  INSERT INTO public.notifications (broker_id, type, title, body)
  VALUES (NEW.broker_id, 'new_lead', 'New enquiry from ' || NEW.name,
          format('%s enquired about %s. Phone: %s', NEW.name, COALESCE(_title, 'your listing'), NEW.phone));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS leads_notify_broker ON public.leads;
CREATE TRIGGER leads_notify_broker AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.notify_new_lead();

CREATE OR REPLACE FUNCTION public.notify_payment_success()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'paid') THEN
    INSERT INTO public.notifications (broker_id, type, title, body)
    VALUES (NEW.broker_id, 'payment_success', 'Payment received',
            format('%s listing credits added to your account.', NEW.credits_granted));
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS credit_purchases_notify ON public.credit_purchases;
CREATE TRIGGER credit_purchases_notify AFTER INSERT OR UPDATE ON public.credit_purchases
FOR EACH ROW EXECUTE FUNCTION public.notify_payment_success();

-- 3. AGENCY MODE --------------------------------------------------------------
ALTER TABLE public.agency_subscriptions ADD COLUMN IF NOT EXISTS seat_limit integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.agency_owner_of(_broker uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(b.agency_id, CASE WHEN b.account_type = 'agency' THEN b.id END)
  FROM public.brokers b WHERE b.id = _broker
$$;

CREATE OR REPLACE FUNCTION public.same_agency(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.agency_owner_of(_a) IS NOT NULL
     AND public.agency_owner_of(_a) = public.agency_owner_of(_b)
$$;

GRANT EXECUTE ON FUNCTION public.agency_owner_of(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.same_agency(uuid, uuid) TO authenticated, service_role;

CREATE POLICY "Agency teammates read agency listings" ON public.properties
FOR SELECT TO authenticated USING (public.same_agency(broker_id, auth.uid()));

CREATE POLICY "Agency owner manages agency listings" ON public.properties
FOR UPDATE TO authenticated
USING (auth.uid() = public.agency_owner_of(broker_id))
WITH CHECK (auth.uid() = public.agency_owner_of(broker_id));

CREATE POLICY "Agency owner reads agency leads" ON public.leads
FOR SELECT TO authenticated USING (auth.uid() = public.agency_owner_of(broker_id));

CREATE POLICY "Agency teammates read each other" ON public.brokers
FOR SELECT TO authenticated USING (public.same_agency(id, auth.uid()));

CREATE POLICY "Agency members read subscription" ON public.agency_subscriptions
FOR SELECT TO authenticated USING (agency_owner_id = public.agency_owner_of(auth.uid()));

-- invite / accept / remove seats
CREATE OR REPLACE FUNCTION public.invite_agency_member(_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _sub public.agency_subscriptions%ROWTYPE; _used integer; _email_norm text;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  _email_norm := lower(trim(_email));
  IF _email_norm !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_email');
  END IF;
  IF (SELECT account_type FROM public.brokers WHERE id = _uid) IS DISTINCT FROM 'agency' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_agency');
  END IF;
  SELECT * INTO _sub FROM public.agency_subscriptions WHERE agency_owner_id = _uid AND status = 'active';
  IF _sub.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'no_active_subscription'); END IF;
  SELECT count(*) INTO _used FROM public.agency_members WHERE agency_owner_id = _uid AND status <> 'removed';
  IF _used >= _sub.seat_limit THEN RETURN jsonb_build_object('ok', false, 'reason', 'seats_full'); END IF;
  IF EXISTS (SELECT 1 FROM public.agency_members WHERE agency_owner_id = _uid AND invited_email = _email_norm AND status <> 'removed') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_invited');
  END IF;
  INSERT INTO public.agency_members (agency_owner_id, invited_email, role, status)
  VALUES (_uid, _email_norm, 'member', 'invited');
  RETURN jsonb_build_object('ok', true, 'seats_used', _used + 1, 'seat_limit', _sub.seat_limit);
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_agency_invite()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _email text; _m public.agency_members%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  SELECT lower(u.email) INTO _email FROM auth.users u WHERE u.id = _uid;
  IF _email IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'no_email'); END IF;
  IF public.agency_owner_of(_uid) IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_in_agency');
  END IF;
  SELECT * INTO _m FROM public.agency_members
    WHERE invited_email = _email AND status = 'invited' ORDER BY created_at LIMIT 1;
  IF _m.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'no_invite'); END IF;
  UPDATE public.agency_members SET member_broker_id = _uid, status = 'active' WHERE id = _m.id;
  UPDATE public.brokers SET agency_id = _m.agency_owner_id, agency_seat_role = 'member' WHERE id = _uid;
  RETURN jsonb_build_object('ok', true, 'agency_owner_id', _m.agency_owner_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_agency_member(_member_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _m public.agency_members%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated'); END IF;
  SELECT * INTO _m FROM public.agency_members WHERE id = _member_id AND agency_owner_id = _uid;
  IF _m.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  UPDATE public.agency_members SET status = 'removed' WHERE id = _m.id;
  IF _m.member_broker_id IS NOT NULL THEN
    UPDATE public.brokers SET agency_id = NULL, agency_seat_role = NULL WHERE id = _m.member_broker_id;
  END IF;
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.pending_agency_invite()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _email text; _owner text;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('invite', false); END IF;
  SELECT lower(u.email) INTO _email FROM auth.users u WHERE u.id = _uid;
  SELECT COALESCE(b.agency_name, b.name) INTO _owner
    FROM public.agency_members m JOIN public.brokers b ON b.id = m.agency_owner_id
    WHERE m.invited_email = _email AND m.status = 'invited' ORDER BY m.created_at LIMIT 1;
  IF _owner IS NULL THEN RETURN jsonb_build_object('invite', false); END IF;
  RETURN jsonb_build_object('invite', true, 'agency_name', _owner);
END;
$$;

REVOKE ALL ON FUNCTION public.invite_agency_member(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_agency_invite() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_agency_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pending_agency_invite() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.invite_agency_member(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_agency_invite() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.remove_agency_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.pending_agency_invite() TO authenticated, service_role;

-- 4. RETIRE V1 PLAN REMNANTS ---------------------------------------------------
ALTER TABLE public.brokers DROP COLUMN IF EXISTS plan;
ALTER TABLE public.brokers DROP COLUMN IF EXISTS property_limit;
DROP TYPE IF EXISTS public.broker_plan;