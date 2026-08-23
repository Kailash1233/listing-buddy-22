ALTER TABLE public.credit_purchases
  ADD COLUMN IF NOT EXISTS cashfree_order_id text,
  ADD COLUMN IF NOT EXISTS cashfree_payment_id text,
  ADD COLUMN IF NOT EXISTS customer_email text;

CREATE UNIQUE INDEX IF NOT EXISTS credit_purchases_cashfree_order_id_key
  ON public.credit_purchases (cashfree_order_id) WHERE cashfree_order_id IS NOT NULL;

ALTER TABLE public.agency_subscriptions
  ADD COLUMN IF NOT EXISTS cashfree_subscription_id text;

CREATE OR REPLACE FUNCTION app_private.settle_credit_purchase(
  _cashfree_order_id text,
  _cashfree_payment_id text,
  _status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app_private
AS $$
DECLARE
  p public.credit_purchases%ROWTYPE;
  new_balance integer;
BEGIN
  SELECT * INTO p FROM public.credit_purchases
   WHERE cashfree_order_id = _cashfree_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unknown_order');
  END IF;

  IF p.status = 'paid' THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'purchase_id', p.id, 'broker_id', p.broker_id);
  END IF;

  IF _status <> 'paid' THEN
    UPDATE public.credit_purchases
       SET status = 'failed', cashfree_payment_id = COALESCE(_cashfree_payment_id, cashfree_payment_id)
     WHERE id = p.id;
    RETURN jsonb_build_object('ok', true, 'paid', false, 'purchase_id', p.id);
  END IF;

  UPDATE public.brokers
     SET listing_credits_remaining = listing_credits_remaining + p.credits_granted
   WHERE id = p.broker_id
  RETURNING listing_credits_remaining INTO new_balance;

  UPDATE public.credit_purchases
     SET status = 'paid', cashfree_payment_id = COALESCE(_cashfree_payment_id, cashfree_payment_id)
   WHERE id = p.id;

  INSERT INTO public.credit_ledger (broker_id, delta, balance_after, reason, purchase_id)
  VALUES (p.broker_id, p.credits_granted, new_balance, 'purchase', p.id);

  RETURN jsonb_build_object('ok', true, 'paid', true, 'purchase_id', p.id,
                            'broker_id', p.broker_id, 'credits', p.credits_granted,
                            'balance', new_balance);
END;
$$;

REVOKE ALL ON FUNCTION app_private.settle_credit_purchase(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.settle_credit_purchase(text, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.settle_credit_purchase(
  _cashfree_order_id text,
  _cashfree_payment_id text,
  _status text
)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, app_private
AS $$ SELECT app_private.settle_credit_purchase(_cashfree_order_id, _cashfree_payment_id, _status) $$;

REVOKE ALL ON FUNCTION public.settle_credit_purchase(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_credit_purchase(text, text, text) TO service_role;