-- Additive core persistence. Existing CRM tables are not modified.
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
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


ALTER TABLE public.projects ALTER COLUMN user_id SET DEFAULT auth.uid();
-- Fail rather than silently claim legacy unowned projects for any account.
ALTER TABLE public.projects ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS secondary_colors text[] DEFAULT '{}';
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}';
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS brand_dna jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS end_date timestamptz;
ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS due_date timestamptz;

CREATE TABLE IF NOT EXISTS public.scheduled_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
 project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
 title text, caption text, hashtags text[], media_url text,
 platforms text[] NOT NULL DEFAULT '{}', scheduled_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'rascunho', error_message text,
 campaign_id uuid, product_id uuid, cta text, type text NOT NULL DEFAULT 'Post',
 reach text NOT NULL DEFAULT '-', engagement text NOT NULL DEFAULT '-',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scheduled_posts ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.scheduled_posts ALTER COLUMN project_id SET NOT NULL;

CREATE TABLE public.pl_editor_documents (
 project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
 document jsonb NOT NULL CHECK (
   jsonb_typeof(document) = 'object'
   AND document ?& ARRAY['slides','canvasFormat','caption']
   AND jsonb_typeof(document->'slides') = 'array'
   AND jsonb_array_length(document->'slides') BETWEEN 1 AND 100
   AND jsonb_typeof(document->'canvasFormat') = 'object'
   AND jsonb_typeof(document->'caption') = 'string'
   AND octet_length(document::text) <= 12582912
 ),
 version integer NOT NULL DEFAULT 1 CHECK (version > 0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION public.pl_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE INDEX IF NOT EXISTS pl_projects_owner_idx ON public.projects(user_id);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY pl_projects_owner ON public.projects FOR ALL TO authenticated
 USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pl_brands_project_idx ON public.brands(project_id);
CREATE POLICY pl_brands_owner ON public.brands FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = brands.project_id AND p.user_id = (select auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = brands.project_id AND p.user_id = (select auth.uid())));

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pl_campaigns_project_idx ON public.campaigns(project_id);
CREATE POLICY pl_campaigns_owner ON public.campaigns FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = campaigns.project_id AND p.user_id = (select auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = campaigns.project_id AND p.user_id = (select auth.uid())));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pl_products_project_idx ON public.products(project_id);
CREATE POLICY pl_products_owner ON public.products FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = products.project_id AND p.user_id = (select auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = products.project_id AND p.user_id = (select auth.uid())));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pl_checklist_items_project_idx ON public.checklist_items(project_id);
CREATE POLICY pl_checklist_items_owner ON public.checklist_items FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = checklist_items.project_id AND p.user_id = (select auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = checklist_items.project_id AND p.user_id = (select auth.uid())));

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pl_scheduled_posts_project_idx ON public.scheduled_posts(project_id);
CREATE POLICY pl_scheduled_posts_owner ON public.scheduled_posts FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = scheduled_posts.project_id AND p.user_id = (select auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = scheduled_posts.project_id AND p.user_id = (select auth.uid())) AND user_id = (select auth.uid()));

ALTER TABLE public.pl_editor_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pl_pl_editor_documents_project_idx ON public.pl_editor_documents(project_id);
CREATE POLICY pl_pl_editor_documents_owner ON public.pl_editor_documents FOR ALL TO authenticated
 USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = pl_editor_documents.project_id AND p.user_id = (select auth.uid())))
 WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = pl_editor_documents.project_id AND p.user_id = (select auth.uid())));
REVOKE ALL ON public.projects FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
CREATE TRIGGER pl_touch_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.pl_touch_updated_at();
REVOKE ALL ON public.brands FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
CREATE TRIGGER pl_touch_brands BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.pl_touch_updated_at();
REVOKE ALL ON public.campaigns FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
CREATE TRIGGER pl_touch_campaigns BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.pl_touch_updated_at();
REVOKE ALL ON public.products FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
CREATE TRIGGER pl_touch_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.pl_touch_updated_at();
REVOKE ALL ON public.checklist_items FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_items TO authenticated;
CREATE TRIGGER pl_touch_checklist_items BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE FUNCTION public.pl_touch_updated_at();
REVOKE ALL ON public.scheduled_posts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_posts TO authenticated;
CREATE TRIGGER pl_touch_scheduled_posts BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE FUNCTION public.pl_touch_updated_at();
REVOKE ALL ON public.pl_editor_documents FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pl_editor_documents TO authenticated;
CREATE TRIGGER pl_touch_pl_editor_documents BEFORE UPDATE ON public.pl_editor_documents FOR EACH ROW EXECUTE FUNCTION public.pl_touch_updated_at();

-- Atomic version check prevents a second tab from silently overwriting newer edits.
CREATE FUNCTION public.pl_save_editor_document(p_project_id uuid, p_document jsonb, p_expected_version integer)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE saved_version integer;
BEGIN
 IF p_expected_version = 0 THEN
   INSERT INTO public.pl_editor_documents(project_id, document) VALUES (p_project_id, p_document)
   ON CONFLICT (project_id) DO NOTHING RETURNING version INTO saved_version;
 ELSE
   UPDATE public.pl_editor_documents SET document = p_document, version = version + 1
   WHERE project_id = p_project_id AND version = p_expected_version RETURNING version INTO saved_version;
 END IF;
 IF saved_version IS NULL THEN
   RAISE EXCEPTION 'O projeto foi alterado em outra aba ou você não tem acesso. Reabra antes de salvar.' USING ERRCODE = '40001';
 END IF;
 RETURN saved_version;
END;
$$;
REVOKE ALL ON FUNCTION public.pl_save_editor_document(uuid, jsonb, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pl_save_editor_document(uuid, jsonb, integer) TO authenticated;
