ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS owner_pin text NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS owner_name text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS trips_owner_pin_idx ON public.trips (owner_pin);