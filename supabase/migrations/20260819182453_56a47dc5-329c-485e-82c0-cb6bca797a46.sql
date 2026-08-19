ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS years_experience integer, ADD COLUMN IF NOT EXISTS deals_closed integer;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS broker_note text;