-- enums
CREATE TYPE public.account_type AS ENUM ('solo','agency');
CREATE TYPE public.agency_seat_role AS ENUM ('owner','member');
CREATE TYPE public.credit_pack AS ENUM ('starter','launch');
CREATE TYPE public.purchase_status AS ENUM ('created','paid','failed');
CREATE TYPE public.agency_plan AS ENUM ('starter_agency','growth_agency');
CREATE TYPE public.subscription_status AS ENUM ('active','past_due','cancelled');
CREATE TYPE public.member_status AS ENUM ('invited','active','removed');
CREATE TYPE public.notification_type AS ENUM ('new_lead','low_credits','payment_success','agency_invite');

ALTER TABLE public.brokers
  ADD COLUMN listing_credits_remaining integer NOT NULL DEFAULT 2,
  ADD COLUMN account_type public.account_type NOT NULL DEFAULT 'solo',
  ADD COLUMN agency_id uuid REFERENCES public.brokers(id) ON DELETE SET NULL,
  ADD COLUMN agency_seat_role public.agency_seat_role;

CREATE TABLE public.credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  pack_type public.credit_pack NOT NULL,
  credits_granted integer NOT NULL DEFAULT 0,
  amount_paise integer NOT NULL DEFAULT 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  status public.purchase_status NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_purchases TO authenticated;
GRANT ALL ON public.credit_purchases TO service_role;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brokers read own purchases" ON public.credit_purchases FOR SELECT TO authenticated USING (auth.uid() = broker_id);

CREATE TABLE public.agency_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_owner_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  plan public.agency_plan NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active',
  monthly_listing_pool integer NOT NULL DEFAULT 0,
  listings_used_this_cycle integer NOT NULL DEFAULT 0,
  razorpay_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_owner_id)
);
GRANT SELECT ON public.agency_subscriptions TO authenticated;
GRANT ALL ON public.agency_subscriptions TO service_role;
ALTER TABLE public.agency_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency owner reads own subscription" ON public.agency_subscriptions FOR SELECT TO authenticated USING (auth.uid() = agency_owner_id);
CREATE TRIGGER agency_subscriptions_updated_at BEFORE UPDATE ON public.agency_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_owner_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  member_broker_id uuid REFERENCES public.brokers(id) ON DELETE SET NULL,
  invited_email text NOT NULL,
  role public.agency_seat_role NOT NULL DEFAULT 'member',
  status public.member_status NOT NULL DEFAULT 'invited',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agency_members TO authenticated;
GRANT ALL ON public.agency_members TO service_role;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency owner manages members" ON public.agency_members FOR ALL TO authenticated USING (auth.uid() = agency_owner_id) WITH CHECK (auth.uid() = agency_owner_id);
CREATE POLICY "Member reads own seat" ON public.agency_members FOR SELECT TO authenticated USING (auth.uid() = member_broker_id);

CREATE TABLE public.payment_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'razorpay',
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_webhook_events TO service_role;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brokers read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = broker_id);
CREATE POLICY "Brokers update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = broker_id) WITH CHECK (auth.uid() = broker_id);
CREATE POLICY "Brokers delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = broker_id);

CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  balance_after integer NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  purchase_id uuid REFERENCES public.credit_purchases(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brokers read own ledger" ON public.credit_ledger FOR SELECT TO authenticated USING (auth.uid() = broker_id);

CREATE INDEX idx_credit_ledger_broker ON public.credit_ledger(broker_id, created_at DESC);
CREATE INDEX idx_notifications_broker ON public.notifications(broker_id, created_at DESC);
CREATE INDEX idx_agency_members_owner ON public.agency_members(agency_owner_id);

-- server-side publish gate: deducts a credit (solo) or agency pool slot
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