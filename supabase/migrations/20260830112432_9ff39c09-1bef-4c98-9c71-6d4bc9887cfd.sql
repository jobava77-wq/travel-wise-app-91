CREATE TABLE public.trips (
  id text PRIMARY KEY,
  name text NOT NULL,
  start_date date NOT NULL DEFAULT current_date,
  end_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared trips are readable by everyone" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Anyone can create shared trips" ON public.trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update shared trips" ON public.trips FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete shared trips" ON public.trips FOR DELETE USING (true);

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id text NOT NULL DEFAULT 'cyprus-2026' REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GEL',
  category text NOT NULL DEFAULT 'tickets',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX expenses_trip_id_created_at_idx ON public.expenses (trip_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared expenses are readable by everyone" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can create shared expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update shared expenses" ON public.expenses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete shared expenses" ON public.expenses FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER TABLE public.expenses REPLICA IDENTITY FULL;

INSERT INTO public.trips (id, name, start_date, end_date)
VALUES ('cyprus-2026', 'Agia Napa, Cyprus', '2026-10-18', '2026-10-22');