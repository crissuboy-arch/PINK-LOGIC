-- Migration: Create Core tables (Projects, Brands, Campaigns, Products, Checklist) and Extend Scheduled Posts
-- Created: 2026-06-07
-- Description: Establishes base tables and alters scheduled_posts to fit the PinkLogic frontend schemas.

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Optional linkage to auth.users if logged in
    name TEXT NOT NULL,
    description TEXT,
    social_accounts TEXT[] NOT NULL DEFAULT '{}',
    email TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create brands table (BrandKit)
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    colors JSONB NOT NULL DEFAULT '{"primary": "#FF2D8D", "secondary": "#7000FF", "accent": "#00E0FF", "background": "#0D0D12", "text": "#FFFFFF", "glow": "#FF2D8D"}',
    fonts JSONB NOT NULL DEFAULT '{"heading": "Outfit", "body": "Inter"}',
    glow TEXT,
    hashtags TEXT[] NOT NULL DEFAULT '{}',
    cta TEXT DEFAULT '',
    tone TEXT DEFAULT '',
    style TEXT DEFAULT '',
    overlays TEXT[] NOT NULL DEFAULT '{}',
    logo TEXT, -- base64 data URL or storage file URL
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    main_product TEXT,
    secondary_product TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    goal TEXT,
    cta TEXT,
    start_date TIMESTAMPTZ,
    linked_post_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    link TEXT,
    platform TEXT,
    price TEXT,
    type TEXT,
    model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    responsible TEXT NOT NULL DEFAULT 'Social Media',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Extend pre-existing scheduled_posts table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scheduled_posts') THEN
        ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS campaign_id UUID;
        ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS product_id UUID;
        ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS cta TEXT;
        ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'Post';
        ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS reach TEXT NOT NULL DEFAULT '-';
        ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS engagement TEXT NOT NULL DEFAULT '-';
    END IF;
END $$;

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_brands_project_id ON brands(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_products_project_id ON products(project_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_project_id ON checklist_items(project_id);

-- Setup automatic updating of updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
