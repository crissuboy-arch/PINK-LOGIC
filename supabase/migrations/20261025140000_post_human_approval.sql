-- ============================================================
-- Pink Logic — aprovação humana de posts (correção Achado 1)
-- A publicação (direta e via cron) exige approved_at preenchido.
-- Idempotente: seguro re-executar.
-- ATENÇÃO: aplicar esta migration ANTES do deploy da branch de
-- segurança — sem estas colunas, publicar e aprovar falham fechados
-- (503), nunca abertos.
-- ============================================================

ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.scheduled_posts ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Índice do cron: só agendados + aprovados + vencidos.
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due_approved
  ON public.scheduled_posts(scheduled_at)
  WHERE status = 'agendado' AND approved_at IS NOT NULL;
