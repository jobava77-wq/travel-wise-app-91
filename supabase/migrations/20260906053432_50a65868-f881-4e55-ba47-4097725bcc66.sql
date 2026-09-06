ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS location_name text,
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS spent_at date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS custom_category text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric;

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_pin text NOT NULL DEFAULT '',
  owner_name text NOT NULL DEFAULT '',
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);