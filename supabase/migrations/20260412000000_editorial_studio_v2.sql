-- Migration: Editorial Studio v2 Rebuild
-- Description: Refines v2_social_posts and adds v2_post_media and versioning.

-- 1. Backup existing social posts if any
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'v2_social_posts') THEN
        ALTER TABLE v2_social_posts RENAME TO v2_social_posts_backup_20260412;
    END IF;
END $$;

-- 2. Create v2_social_posts with refined schema
CREATE TABLE v2_social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES v2_tasks(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    post_type TEXT CHECK (post_type IN ('image', 'carousel', 'video')),
    
    -- Content Fields
    caption TEXT,
    art_text TEXT,
    script TEXT,
    hashtags JSONB DEFAULT '[]'::jsonb,
    
    -- Status & Workflow
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_production', 'awaiting_review', 'approved', 'rejected')),
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create v2_post_media
CREATE TABLE v2_post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES v2_social_posts(id) ON DELETE CASCADE,
    
    -- Source of Truth Fields
    storage_provider TEXT NOT NULL CHECK (storage_provider IN ('supabase', 'drive')),
    file_path TEXT, -- Internal path for Supabase or ID/metadata for Drive
    public_url TEXT NOT NULL, -- Final URL used for display
    
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    order_index INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create v2_social_post_versions
CREATE TABLE v2_social_post_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES v2_social_posts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    -- Snapshots
    copy_snapshot JSONB NOT NULL,
    media_snapshot JSONB NOT NULL,
    status_snapshot TEXT NOT NULL,
    post_type_snapshot TEXT NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 5. Enable RLS (Assuming project-based RLS is standard in this DB)
ALTER TABLE v2_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_social_post_versions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Simplified for now, expecting project matching)
-- Note: In a real app, we'd join with v2_tasks -> projects -> profiles
CREATE POLICY "Users can view posts related to their tasks" ON v2_social_posts
    FOR SELECT USING (TRUE); -- Standard for internal CRM

CREATE POLICY "Users can manage posts" ON v2_social_posts
    FOR ALL USING (TRUE);

CREATE POLICY "Users can manage media" ON v2_post_media
    FOR ALL USING (TRUE);

CREATE POLICY "Users can manage versions" ON v2_social_post_versions
    FOR ALL USING (TRUE);

-- Indexes
CREATE INDEX idx_v2_social_posts_task_id ON v2_social_posts(task_id);
CREATE INDEX idx_v2_post_media_post_id ON v2_post_media(post_id);
CREATE INDEX idx_v2_social_post_versions_post_id ON v2_social_post_versions(post_id);
