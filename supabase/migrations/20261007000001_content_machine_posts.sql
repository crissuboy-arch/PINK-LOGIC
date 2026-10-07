-- ============================================================
-- PINK-LOGIC v2 — máquina de conteúdo: posts + agendamento
-- Estados: DRAFT → PENDING_REVIEW → SCHEDULED → PUBLISHING → PUBLISHED/FAILED
-- A porta do Jev decide DRAFT → PENDING_REVIEW | SCHEDULED.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pl_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID,
  caption TEXT NOT NULL,
  image_url TEXT,
  hashtags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','PENDING_REVIEW','SCHEDULED','PUBLISHING','PUBLISHED','FAILED')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  decision JSONB DEFAULT '{}',
  publish_results JSONB DEFAULT '{}',
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pl_posts_status ON public.pl_posts(status);
CREATE INDEX IF NOT EXISTS idx_pl_posts_scheduled ON public.pl_posts(scheduled_at)
  WHERE status = 'SCHEDULED';

ALTER TABLE public.pl_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pl_posts_owner" ON public.pl_posts;
CREATE POLICY "pl_posts_owner" ON public.pl_posts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
