-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'writer', 'designer', 'client');
CREATE TYPE post_status AS ENUM (
  'draft',           -- Redator trabalhando na copy
  'copy_review',     -- Aguardando aprovação de copy pelo cliente
  'copy_rejected',   -- Copy reprovada pelo cliente
  'design_draft',    -- Copy aprovada, designer trabalhando
  'design_review',   -- Aguardando aprovação de design pelo cliente
  'design_rejected', -- Design reprovado pelo cliente
  'approved'         -- Post completamente aprovado
);

-- Clients Table
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts Table
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    status post_status NOT NULL DEFAULT 'draft',
    publish_date TIMESTAMP WITH TIME ZONE,
    copy_content TEXT,
    design_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post Versions (History)
CREATE TABLE public.post_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('copy', 'design')),
    content TEXT NOT NULL, -- Text for copy, URL for design
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    stage TEXT NOT NULL CHECK (stage IN ('copy', 'design')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Setups

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check user role and client_id
-- We will use the 'profiles' table to enforce restrictions.

-- Clients policies:
-- Internal users (admin, writer, designer) can view all clients. Client users can only view their own client row.
CREATE POLICY "Employees can view all clients" ON public.clients FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'writer', 'designer')));

CREATE POLICY "Clients can view their own client profile" ON public.clients FOR SELECT
    USING (id = (SELECT client_id FROM public.profiles p WHERE p.id = auth.uid()));

-- Only admin can modify clients (MVP)
CREATE POLICY "Admins can insert clients" ON public.clients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
CREATE POLICY "Admins can update clients" ON public.clients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Profiles policies:
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
-- Internal users can view all profiles for operational needs
CREATE POLICY "Employees can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'writer', 'designer')));

-- Posts policies:
-- Admins, writers, designers can view and update all posts
CREATE POLICY "Employees can manage all posts" ON public.posts FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'writer', 'designer')));
-- Clients can only manage (view/update status) posts for their own client_id
CREATE POLICY "Clients can view their posts" ON public.posts FOR SELECT USING (client_id = (SELECT client_id FROM public.profiles p WHERE p.id = auth.uid()));
CREATE POLICY "Clients can update their posts" ON public.posts FOR UPDATE USING (client_id = (SELECT client_id FROM public.profiles p WHERE p.id = auth.uid()));

-- Post Versions & Comments policies:
CREATE POLICY "Employees can manage versions and comments" ON public.post_versions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'writer', 'designer')));
CREATE POLICY "Employees can manage comments" ON public.comments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'writer', 'designer')));

CREATE POLICY "Clients can view versions of their posts" ON public.post_versions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.posts p JOIN public.profiles prof ON p.client_id = prof.client_id WHERE p.id = post_versions.post_id AND prof.id = auth.uid())
);
CREATE POLICY "Clients can view and insert comments on their posts" ON public.comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.posts p JOIN public.profiles prof ON p.client_id = prof.client_id WHERE p.id = comments.post_id AND prof.id = auth.uid())
);
CREATE POLICY "Clients can insert comments on their posts" ON public.comments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts p JOIN public.profiles prof ON p.client_id = prof.client_id WHERE p.id = comments.post_id AND prof.id = auth.uid())
);

-- Trigger for updated_at in posts
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_modtime
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Function to handle new user signups and create a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Setup Storage for Attachments / Images
INSERT INTO storage.buckets (id, name, public) VALUES ('post_designs', 'post_designs', true);
-- Allow authenticated uploads to 'post_designs' (Simple MVP rule: any authenticated user. We can restrict further if needed)
CREATE POLICY "Authenticated users can upload objects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post_designs');
CREATE POLICY "Public read access to objects" ON storage.objects FOR SELECT USING (bucket_id = 'post_designs');
