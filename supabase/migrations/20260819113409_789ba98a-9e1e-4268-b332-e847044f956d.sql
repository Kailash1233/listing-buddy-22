
CREATE TYPE public.broker_plan AS ENUM ('free','starter','pro');
CREATE TYPE public.property_type AS ENUM ('apartment','villa','plot','commercial');
CREATE TYPE public.listing_type AS ENUM ('sale','rent');
CREATE TYPE public.property_status AS ENUM ('draft','active','sold','rented','inactive');
CREATE TYPE public.rera_status AS ENUM ('not_provided','provided_unverified');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','site_visit','closed','lost');
CREATE TYPE public.event_type AS ENUM ('view','whatsapp_click','call_click','enquiry_submit');

CREATE TABLE public.brokers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '',
  agency_name text,
  subdomain_slug text UNIQUE NOT NULL,
  plan public.broker_plan NOT NULL DEFAULT 'free',
  property_limit int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.brokers TO authenticated;
GRANT SELECT ON public.brokers TO anon;
GRANT ALL ON public.brokers TO service_role;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Broker profiles are publicly viewable" ON public.brokers FOR SELECT USING (true);
CREATE POLICY "Brokers insert own profile" ON public.brokers FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Brokers update own profile" ON public.brokers FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text,
  whatsapp_message text,
  meta_description text,
  property_type public.property_type NOT NULL DEFAULT 'apartment',
  listing_type public.listing_type NOT NULL DEFAULT 'sale',
  price numeric,
  price_display text,
  bhk int,
  area_sqft numeric,
  floor text,
  facing text,
  parking text,
  status public.property_status NOT NULL DEFAULT 'draft',
  locality text,
  city text NOT NULL DEFAULT 'Chennai',
  address_text text,
  lat numeric,
  lng numeric,
  amenities text[] NOT NULL DEFAULT '{}',
  rera_number text,
  rera_status public.rera_status NOT NULL DEFAULT 'not_provided',
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  floor_plan_url text,
  pdf_url text,
  view_count int NOT NULL DEFAULT 0,
  whatsapp_click_count int NOT NULL DEFAULT 0,
  call_click_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (broker_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published properties are public" ON public.properties FOR SELECT USING (status IN ('active','sold','rented') OR auth.uid() = broker_id);
CREATE POLICY "Brokers insert own properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = broker_id);
CREATE POLICY "Brokers update own properties" ON public.properties FOR UPDATE TO authenticated USING (auth.uid() = broker_id) WITH CHECK (auth.uid() = broker_id);
CREATE POLICY "Brokers delete own properties" ON public.properties FOR DELETE TO authenticated USING (auth.uid() = broker_id);

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  broker_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp_number text,
  budget_min numeric,
  budget_max numeric,
  message text,
  status public.lead_status NOT NULL DEFAULT 'new',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brokers read own leads" ON public.leads FOR SELECT TO authenticated USING (auth.uid() = broker_id);
CREATE POLICY "Brokers update own leads" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = broker_id) WITH CHECK (auth.uid() = broker_id);
CREATE POLICY "Brokers delete own leads" ON public.leads FOR DELETE TO authenticated USING (auth.uid() = broker_id);
CREATE POLICY "Anyone can submit an enquiry" ON public.leads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.properties p WHERE p.id = leads.property_id AND p.broker_id = leads.broker_id AND p.status = 'active')
);

CREATE TABLE public.property_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  broker_id uuid NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  event_type public.event_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX property_events_broker_idx ON public.property_events (broker_id, created_at DESC);
GRANT SELECT ON public.property_events TO authenticated;
GRANT ALL ON public.property_events TO service_role;
ALTER TABLE public.property_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brokers read own events" ON public.property_events FOR SELECT TO authenticated USING (auth.uid() = broker_id);

CREATE OR REPLACE FUNCTION public.track_property_event(_property_id uuid, _event_type public.event_type)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _broker uuid;
BEGIN
  SELECT broker_id INTO _broker FROM public.properties WHERE id = _property_id AND status = 'active';
  IF _broker IS NULL THEN RETURN; END IF;
  INSERT INTO public.property_events (property_id, broker_id, event_type) VALUES (_property_id, _broker, _event_type);
  IF _event_type = 'view' THEN
    UPDATE public.properties SET view_count = view_count + 1 WHERE id = _property_id;
  ELSIF _event_type = 'whatsapp_click' THEN
    UPDATE public.properties SET whatsapp_click_count = whatsapp_click_count + 1 WHERE id = _property_id;
  ELSIF _event_type = 'call_click' THEN
    UPDATE public.properties SET call_click_count = call_click_count + 1 WHERE id = _property_id;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.track_property_event(uuid, public.event_type) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER brokers_updated_at BEFORE UPDATE ON public.brokers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Brokers read own property media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'property-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Brokers upload own property media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Brokers update own property media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Brokers delete own property media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-media' AND (storage.foldername(name))[1] = auth.uid()::text);
