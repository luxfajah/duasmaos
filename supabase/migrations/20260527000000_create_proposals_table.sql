CREATE TABLE IF NOT EXISTS public.proposals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Allow public read access (necessary for the static presentation template to fetch the data)
CREATE POLICY "Allow public read access for proposals"
ON public.proposals
FOR SELECT
TO public
USING (true);

-- Allow authenticated full access
CREATE POLICY "Allow authenticated full access for proposals"
ON public.proposals
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
