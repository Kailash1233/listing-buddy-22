CREATE OR REPLACE FUNCTION public.guard_property_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active')
     AND current_setting('app.publishing', true) IS DISTINCT FROM '1'
     AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Publishing requires a listing credit. Use publish_property().';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS properties_publish_guard ON public.properties;
CREATE TRIGGER properties_publish_guard
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_property_publish();

CREATE OR REPLACE FUNCTION public.publish_property(_property_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _prop public.properties%ROWTYPE;
  _broker public.brokers%ROWTYPE;
  _owner uuid;
  _sub public.agency_subscriptions%ROWTYPE;
  _bal integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT * INTO _prop FROM public.properties WHERE id = _property_id AND broker_id = _uid;
  IF _prop.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF _prop.status = 'active' THEN
    RETURN jsonb_build_object('ok', true, 'reason', 'already_active');
  END IF;

  SELECT * INTO _broker FROM public.brokers WHERE id = _uid;
  _owner := COALESCE(_broker.agency_id, CASE WHEN _broker.account_type = 'agency' THEN _broker.id END);

  PERFORM set_config('app.publishing', '1', true);

  IF _owner IS NOT NULL THEN
    SELECT * INTO _sub FROM public.agency_subscriptions
      WHERE agency_owner_id = _owner AND status = 'active' FOR UPDATE;
    IF _sub.id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'no_active_subscription');
    END IF;
    IF _sub.listings_used_this_cycle >= _sub.monthly_listing_pool THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'pool_exhausted');
    END IF;
    UPDATE public.agency_subscriptions
      SET listings_used_this_cycle = listings_used_this_cycle + 1
      WHERE id = _sub.id;
    UPDATE public.properties SET status = 'active' WHERE id = _property_id;
    RETURN jsonb_build_object('ok', true, 'pool_used', _sub.listings_used_this_cycle + 1, 'pool', _sub.monthly_listing_pool);
  END IF;

  SELECT listing_credits_remaining INTO _bal FROM public.brokers WHERE id = _uid FOR UPDATE;
  IF COALESCE(_bal, 0) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_credits');
  END IF;

  UPDATE public.brokers SET listing_credits_remaining = listing_credits_remaining - 1 WHERE id = _uid;
  UPDATE public.properties SET status = 'active' WHERE id = _property_id;
  INSERT INTO public.credit_ledger (broker_id, delta, reason, balance_after, property_id)
    VALUES (_uid, -1, 'publish', _bal - 1, _property_id);

  IF _bal - 1 <= 1 THEN
    INSERT INTO public.notifications (broker_id, type, title, body)
      VALUES (_uid, 'low_credits', 'Running low on listings',
              format('You have %s listing credit(s) left. Top up to keep publishing.', _bal - 1));
  END IF;

  RETURN jsonb_build_object('ok', true, 'credits_remaining', _bal - 1);
END;
$$;

REVOKE ALL ON FUNCTION public.publish_property(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_property(uuid) TO authenticated;