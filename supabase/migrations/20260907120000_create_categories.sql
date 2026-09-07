CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 40),
  icon text NOT NULL DEFAULT 'Tag',
  color text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_owner_id_idx ON public.categories (owner_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create their categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their categories" ON public.categories;

CREATE POLICY "Users can read their categories" ON public.categories
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Users can create their categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update their categories" ON public.categories
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete their categories" ON public.categories
  FOR DELETE TO authenticated USING (owner_id = auth.uid());