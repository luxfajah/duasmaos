-- consolidated schema v2.0.1 beta

-- 1. Drop existing tables if they exist (clean slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_posts_modtime ON public.posts CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_modified_column() CASCADE;

DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.revenue_recurrences CASCADE;
DROP TABLE IF EXISTS public.revenues CASCADE;
DROP TABLE IF EXISTS public.project_documents CASCADE;
DROP TABLE IF EXISTS public.product_template_tasks CASCADE;
DROP TABLE IF EXISTS public.product_template_stages CASCADE;
DROP TABLE IF EXISTS public.product_templates CASCADE;
DROP TABLE IF EXISTS public.task_comments CASCADE;
DROP TABLE IF EXISTS public.v2_task_assignees CASCADE;
DROP TABLE IF EXISTS public.v2_stage_approvals CASCADE;
DROP TABLE IF EXISTS public.v2_task_templates CASCADE;
DROP TABLE IF EXISTS public.v2_stage_templates CASCADE;
DROP TABLE IF EXISTS public.v2_project_members CASCADE;
DROP TABLE IF EXISTS public.v2_social_post_versions CASCADE;
DROP TABLE IF EXISTS public.v2_post_media CASCADE;
DROP TABLE IF EXISTS public.v2_social_posts CASCADE;
DROP TABLE IF EXISTS public.v2_tasks CASCADE;
DROP TABLE IF EXISTS public.v2_project_stages CASCADE;
DROP TABLE IF EXISTS public.v2_projects CASCADE;
DROP TABLE IF EXISTS public.v2_workspaces CASCADE;
DROP TABLE IF EXISTS public.client_portal_settings CASCADE;
DROP TABLE IF EXISTS public.client_documents CASCADE;
DROP TABLE IF EXISTS public.client_addresses CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Drop enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS pipeline_stage CASCADE;
DROP TYPE IF EXISTS project_status_v2 CASCADE;
DROP TYPE IF EXISTS task_status_v2 CASCADE;
DROP TYPE IF EXISTS task_priority_v2 CASCADE;
DROP TYPE IF EXISTS workflow_type_v2 CASCADE;
DROP TYPE IF EXISTS task_type_v2 CASCADE;
DROP TYPE IF EXISTS post_type_v2 CASCADE;
DROP TYPE IF EXISTS post_status_v2 CASCADE;
DROP TYPE IF EXISTS client_approval_status CASCADE;
DROP TYPE IF EXISTS revenue_status CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS recurrence_frequency CASCADE;

-- 2. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'gestor', 'writer', 'designer', 'client');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'paused');
CREATE TYPE pipeline_stage AS ENUM ('Lead', 'Diagnóstico', 'Proposta', 'Negociação', 'Fechado', 'Onboarding');
CREATE TYPE project_status_v2 AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE task_status_v2 AS ENUM ('locked', 'pending', 'in_progress', 'in_review', 'approved', 'done', 'blocked');
CREATE TYPE task_priority_v2 AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE workflow_type_v2 AS ENUM ('branding', 'social_media', 'website', 'consultoria');
CREATE TYPE task_type_v2 AS ENUM ('operational', 'content_post', 'approval', 'document', 'task', 'meeting', 'review', 'deliverable');
CREATE TYPE post_type_v2 AS ENUM ('image', 'carousel', 'video');
CREATE TYPE post_status_v2 AS ENUM ('draft', 'in_production', 'awaiting_review', 'approved', 'rejected');
CREATE TYPE client_approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');
CREATE TYPE revenue_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_type AS ENUM ('one_time', 'installment', 'recurring');
CREATE TYPE recurrence_frequency AS ENUM ('monthly', 'weekly', 'custom');

-- 3. Create Tables

-- Clients Table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('pf', 'pj')),
    name TEXT NOT NULL,
    company TEXT, -- Legacy
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    status client_status NOT NULL DEFAULT 'active',
    pipeline_stage pipeline_stage DEFAULT 'Lead',
    notes TEXT,
    website TEXT,
    segment TEXT,
    
    -- PF Specific
    cpf TEXT,
    birth_date DATE,
    
    -- PJ Specific
    trade_name TEXT,
    cnpj TEXT,
    responsible_name TEXT,
    
    -- CRM
    lead_source TEXT,
    account_manager_id UUID,
    
    contacts JSONB DEFAULT '[]'::jsonb, -- Array of contacts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'client',
    full_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Complete link back to account manager in clients
ALTER TABLE public.clients ADD CONSTRAINT fk_clients_account_manager FOREIGN KEY (account_manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Client Addresses
CREATE TABLE public.client_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    zip_code TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    city TEXT,
    state TEXT,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Client Documents
CREATE TABLE public.client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Client Portal Settings
CREATE TABLE public.client_portal_settings (
    client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    wallpaper_url TEXT,
    theme_color_primary TEXT DEFAULT '#BE4B00',
    theme_color_secondary TEXT DEFAULT '#B4053C',
    ig_username TEXT NOT NULL,
    ig_name TEXT NOT NULL,
    ig_bio TEXT,
    ig_avatar_url TEXT,
    ig_stats_posts INTEGER DEFAULT 0,
    ig_stats_followers TEXT DEFAULT '0',
    ig_stats_following TEXT DEFAULT '0',
    ig_highlights JSONB DEFAULT '[]'::jsonb, -- Array of highlight objects
    portal_user TEXT,
    portal_password TEXT,
    focus_of_month TEXT,
    planning_period TEXT,
    deadline_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invitations Table
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    token TEXT UNIQUE NOT NULL,
    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- V2 Workspace
CREATE TABLE public.v2_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- V2 Projects Table
CREATE TABLE public.v2_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.v2_workspaces(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    workflow_type workflow_type_v2 NOT NULL,
    status project_status_v2 NOT NULL DEFAULT 'active',
    priority task_priority_v2 DEFAULT 'medium',
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type payment_type NOT NULL DEFAULT 'one_time',
    amount NUMERIC(12,2),
    billing_day INTEGER,
    auto_restart BOOLEAN DEFAULT false,
    start_date DATE,
    deadline TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- V2 Project Stages
CREATE TABLE public.v2_project_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.v2_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage_key TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, waiting_approval, approved, done
    requires_approval BOOLEAN DEFAULT false,
    duration_days INTEGER DEFAULT 7,
    start_mode TEXT DEFAULT 'auto',
    depends_on_stage_key TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- V2 Tasks
CREATE TABLE public.v2_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.v2_projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.v2_project_stages(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type task_type_v2 NOT NULL DEFAULT 'task',
    task_type task_type_v2 NOT NULL DEFAULT 'task', -- duplicate access column
    deliverable_type TEXT DEFAULT 'default', -- copy, design, strategy, etc
    status task_status_v2 NOT NULL DEFAULT 'locked',
    priority task_priority_v2 NOT NULL DEFAULT 'medium',
    "order" INTEGER,
    stage_order INTEGER,
    depends_on_task_id UUID REFERENCES public.v2_tasks(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    deadline_offset_days INTEGER DEFAULT 0,
    offset_type TEXT DEFAULT 'stage_start',
    parent_task_id UUID REFERENCES public.v2_tasks(id) ON DELETE SET NULL,
    html_content TEXT,
    delivery_content TEXT,
    delivery_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Task Assignees (Join Table)
CREATE TABLE public.v2_task_assignees (
    task_id UUID NOT NULL REFERENCES public.v2_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)
);

-- V2 Social Posts
CREATE TABLE public.v2_social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.v2_tasks(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL DEFAULT 0,
    post_type post_type_v2 NOT NULL DEFAULT 'image',
    status post_status_v2 NOT NULL DEFAULT 'draft',
    requires_approval BOOLEAN DEFAULT true,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    
    -- Client portal approval
    client_approval_status client_approval_status NOT NULL DEFAULT 'pending',
    client_approved_at TIMESTAMP WITH TIME ZONE,
    client_rejected_at TIMESTAMP WITH TIME ZONE,
    
    caption TEXT,
    art_text TEXT,
    carousel_slides INTEGER DEFAULT 1,
    script TEXT,
    hashtags JSONB DEFAULT '[]'::jsonb, -- Array of strings
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- V2 Post Media
CREATE TABLE public.v2_post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.v2_social_posts(id) ON DELETE CASCADE,
    storage_provider TEXT NOT NULL CHECK (storage_provider IN ('supabase', 'drive')),
    file_path TEXT,
    public_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- V2 Social Post Versions
CREATE TABLE public.v2_social_post_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.v2_social_posts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    copy_snapshot JSONB NOT NULL,
    media_snapshot JSONB NOT NULL,
    status_snapshot TEXT NOT NULL,
    post_type_snapshot TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- V2 Project Members
CREATE TABLE public.v2_project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.v2_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- V2 Stage Templates
CREATE TABLE public.v2_stage_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type workflow_type_v2 NOT NULL,
    name TEXT NOT NULL,
    stage_key TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    requires_approval BOOLEAN DEFAULT false
);

-- V2 Task Templates
CREATE TABLE public.v2_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type workflow_type_v2 NOT NULL,
    stage_key TEXT NOT NULL,
    title TEXT NOT NULL,
    type task_type_v2 NOT NULL DEFAULT 'task',
    deliverable_type TEXT DEFAULT 'default',
    "order" INTEGER DEFAULT 0
);

-- V2 Stage Approvals
CREATE TABLE public.v2_stage_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES public.v2_project_stages(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    approved_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending'
);

-- Task Comments / Discussion
CREATE TABLE public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.v2_tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    pos_x NUMERIC,
    pos_y NUMERIC,
    comment_type TEXT DEFAULT 'general' NOT NULL,
    social_post_id UUID REFERENCES public.v2_social_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Proposals Table
CREATE TABLE public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL,
    content JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Product Templates (Expansion)
CREATE TABLE public.product_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    base_price NUMERIC(12,2),
    type TEXT NOT NULL, -- single, subscription, etc.
    is_active BOOLEAN DEFAULT true,
    is_sequential BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Template Stages
CREATE TABLE public.product_template_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.product_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_days INTEGER NOT NULL DEFAULT 7,
    auto_start BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product Template Tasks
CREATE TABLE public.product_template_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES public.product_template_stages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    role TEXT,
    deadline_offset INTEGER DEFAULT 0,
    task_type TEXT NOT NULL DEFAULT 'task',
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Revenues Table
CREATE TABLE public.revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.v2_projects(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status revenue_status NOT NULL DEFAULT 'pending',
    type payment_type NOT NULL DEFAULT 'one_time',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Revenue Recurrences Table
CREATE TABLE public.revenue_recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.v2_projects(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    frequency recurrence_frequency NOT NULL DEFAULT 'monthly',
    billing_day INTEGER,
    next_due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    revenue_id UUID NOT NULL REFERENCES public.revenues(id) ON DELETE CASCADE,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    method TEXT NOT NULL, -- pix, credit_card, boleto, cash, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Project Documents
CREATE TABLE public.project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.v2_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- contract, briefing, other
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 4. Enable Row Level Security (RLS) on all tables

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_social_post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_stage_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v2_stage_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_template_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_recurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;


-- 5. RLS Policies

-- clients
CREATE POLICY "authenticated_select_clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_clients" ON public.clients FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor'))
);

-- profiles
CREATE POLICY "select_profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- client_addresses, client_documents, client_portal_settings
CREATE POLICY "authenticated_select_addresses" ON public.client_addresses FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_addresses" ON public.client_addresses FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "authenticated_select_documents" ON public.client_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_documents" ON public.client_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "public_select_portal_settings" ON public.client_portal_settings FOR SELECT USING (is_active = true);
CREATE POLICY "authenticated_select_portal_settings" ON public.client_portal_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_portal_settings" ON public.client_portal_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

-- v2_workspaces, v2_projects, v2_project_stages, v2_tasks
CREATE POLICY "authenticated_select_workspaces" ON public.v2_workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_workspaces" ON public.v2_workspaces FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "authenticated_select_projects" ON public.v2_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_projects" ON public.v2_projects FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "authenticated_select_stages" ON public.v2_project_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_stages" ON public.v2_project_stages FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "authenticated_select_tasks" ON public.v2_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update_tasks" ON public.v2_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_all_tasks" ON public.v2_tasks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

-- v2_social_posts, v2_post_media, v2_social_post_versions
CREATE POLICY "public_select_posts" ON public.v2_social_posts FOR SELECT USING (true);
CREATE POLICY "authenticated_all_posts" ON public.v2_social_posts FOR ALL TO authenticated USING (true);

CREATE POLICY "public_select_media" ON public.v2_post_media FOR SELECT USING (true);
CREATE POLICY "authenticated_all_media" ON public.v2_post_media FOR ALL TO authenticated USING (true);

CREATE POLICY "public_select_post_versions" ON public.v2_social_post_versions FOR SELECT USING (true);
CREATE POLICY "authenticated_all_post_versions" ON public.v2_social_post_versions FOR ALL TO authenticated USING (true);

-- v2_project_members, v2_stage_templates, v2_task_templates, v2_stage_approvals, task_comments
CREATE POLICY "authenticated_select_members" ON public.v2_project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_members" ON public.v2_project_members FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "select_templates" ON public.v2_stage_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_templates" ON public.v2_stage_templates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "select_task_templates" ON public.v2_task_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_task_templates" ON public.v2_task_templates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "authenticated_all_stage_approvals" ON public.v2_stage_approvals FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_all_task_comments" ON public.task_comments FOR ALL TO authenticated USING (true);

-- proposals, product_templates, product_template_stages, product_template_tasks
CREATE POLICY "public_select_proposals" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "authenticated_all_proposals" ON public.proposals FOR ALL TO authenticated USING (true);

CREATE POLICY "authenticated_select_product_templates" ON public.product_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_product_templates" ON public.product_templates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "authenticated_select_product_stages" ON public.product_template_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_product_stages" ON public.product_template_stages FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "authenticated_select_product_tasks" ON public.product_template_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_product_tasks" ON public.product_template_tasks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- revenues, revenue_recurrences, payments, project_documents
CREATE POLICY "authenticated_select_revenues" ON public.revenues FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_revenues" ON public.revenues FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "authenticated_select_recurrences" ON public.revenue_recurrences FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_recurrences" ON public.revenue_recurrences FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "authenticated_select_payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_payments" ON public.payments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

CREATE POLICY "authenticated_select_proj_docs" ON public.project_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_proj_docs" ON public.project_documents FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor')));

-- invitations
CREATE POLICY "admin_all_invitations" ON public.invitations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "public_select_invitations" ON public.invitations FOR SELECT USING (used = false);


-- 6. Triggers

-- Trigger function: Update updated_at columns
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.v2_projects FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.v2_tasks FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_social_posts_modtime BEFORE UPDATE ON public.v2_social_posts FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_portal_settings_modtime BEFORE UPDATE ON public.client_portal_settings FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Trigger function: Handle new user creation and auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, first_name, last_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), 
    COALESCE(new.raw_user_meta_data->>'first_name', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 7. Storage Bucket Setup
-- Note: inserting bucket directly
INSERT INTO storage.buckets (id, name, public) VALUES ('post_designs', 'post_designs', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Authenticated users can upload objects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post_designs');
CREATE POLICY "Public read access to objects" ON storage.objects FOR SELECT USING (bucket_id = 'post_designs');
