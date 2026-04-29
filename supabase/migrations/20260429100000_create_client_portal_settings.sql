-- Create client_portal_settings table
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
    ig_highlights JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_client_portal_settings_slug ON public.client_portal_settings(slug);

-- RLS
ALTER TABLE public.client_portal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.client_portal_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.client_portal_settings
    FOR ALL USING (auth.role() = 'authenticated');
