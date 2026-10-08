-- ============================================================
-- Pink Logic — campos de publicação real (Instagram + Facebook)
-- Estende scheduled_posts (a tabela que o site e a Athena já usam).
-- Idempotente: seguro re-executar.
-- ============================================================

ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS aspect_ratio text;
-- De onde o post veio: web (site), mcp (Athena), telegram (reservado — hoje a Athena
-- é quem fala com o Telegram, mas fica pronto caso um dia exista um bot próprio).
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'web';
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;
-- IDs devolvidos pela Graph API da Meta após publicar (um post pode ir para as duas redes).
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS ig_media_id text;
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS fb_post_id text;
-- Resultado por rede (ex.: {"instagram":{"ok":true,"id":"..."},"facebook":{"ok":false,"error":"..."}})
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS publish_results jsonb;
-- Decisão do Jev quando o post passa pela porta de aprovação (criado via API/MCP).
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS decision jsonb;

-- O cron de publicação busca por status='agendado' e scheduled_at vencido.
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due
  ON public.scheduled_posts(scheduled_at)
  WHERE status = 'agendado';
