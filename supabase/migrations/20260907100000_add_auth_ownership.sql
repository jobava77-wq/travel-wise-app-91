ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS trips_owner_id_idx ON public.trips (owner_id);
CREATE INDEX IF NOT EXISTS expenses_owner_id_idx ON public.expenses (owner_id);

DROP POLICY IF EXISTS "Shared trips are readable by everyone" ON public.trips;
DROP POLICY IF EXISTS "Anyone can create shared trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can update shared trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can delete shared trips" ON public.trips;
CREATE POLICY "Users can read their trips" ON public.trips FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create their trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update their trips" ON public.trips FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete their trips" ON public.trips FOR DELETE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Shared expenses are readable by everyone" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can create shared expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can update shared expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can delete shared expenses" ON public.expenses;
CREATE POLICY "Users can read their expenses" ON public.expenses FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create their expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update their expenses" ON public.expenses FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete their expenses" ON public.expenses FOR DELETE TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Authenticated users can submit feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());