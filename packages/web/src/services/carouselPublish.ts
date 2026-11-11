// ---------------------------------------------------------------------------
// Publicação / agendamento — Fase 2 (passo m).
//
// SÓ AVALIAÇÃO + esqueleto DESACTIVADO. Não há chamadas ao vivo, não há
// credenciais, não há publicação. O adaptador existe para o código futuro
// se apoiar no mesmo contrato — hoje recusa sempre, com o motivo.
//
// O gate humano é a única porta: um projecto só pode ser agendado quando
// tem approvedBy + approvedAt (definidos por approveProject) E todos os
// slides aprovados. Sem isto, schedule() nem sequer é chamado.
// ---------------------------------------------------------------------------
import type { CarouselProject } from './carouselFlow';

export type PublishChannel = 'instagram' | 'composio';

export interface PublishAdapter {
  channel: PublishChannel;
  /** Sempre false nesta fase — o adaptador está desactivado por decisão. */
  enabled: boolean;
  /** Motivo da desactivação (mostrado na UI, nunca um erro opaco). */
  disabledReason: string;
  publish(): Promise<never>;
  schedule(): Promise<never>;
}

export const INSTAGRAM_DISABLED_REASON =
  'Publicação no Instagram desactivada: falta a ligação oficial (conta + permissões) e a decisão da dona. Nada é publicado sem aprovação humana caso a caso.';
export const COMPOSIO_DISABLED_REASON =
  'Composio desactivado: não há conta, credenciais nem avaliação concluída. O adaptador fica como esqueleto até haver uma avaliação aprovada.';

export function disabledAdapter(channel: PublishChannel): PublishAdapter {
  const reason = channel === 'instagram' ? INSTAGRAM_DISABLED_REASON : COMPOSIO_DISABLED_REASON;
  const refuse = async (): Promise<never> => {
    throw new Error(`Adaptador ${channel} desactivado: ${reason}`);
  };
  return { channel, enabled: false, disabledReason: reason, publish: refuse, schedule: refuse };
}

export function listAdapters(): PublishAdapter[] {
  return [disabledAdapter('instagram'), disabledAdapter('composio')];
}

// ---------------------------------------------------------------------------
// Gate de agendamento (humano). project.slides carrega reviewStatus quando
// vem do Editor; slides sem estado contam como NÃO aprovados.
// ---------------------------------------------------------------------------

export interface ScheduleGate {
  ok: boolean;
  reasons: string[];
}

export function checkScheduleGate(project: CarouselProject, slideStatuses: ('pendente' | 'aprovado' | 'corrigido')[]): ScheduleGate {
  const reasons: string[] = [];
  if (!project.approvedBy || !project.approvedAt) {
    reasons.push('O projecto ainda não foi aprovado pela dona (approvedBy/approvedAt em falta).');
  }
  if (!slideStatuses.length) {
    reasons.push('O projecto não tem slides.');
  } else if (slideStatuses.some((s) => s !== 'aprovado')) {
    const pending = slideStatuses.filter((s) => s !== 'aprovado').length;
    reasons.push(`${pending} slide(s) ainda não aprovado(s) — rever cada card antes de agendar.`);
  }
  if (!project.slides.length) reasons.push('O projecto não tem conteúdo de slides.');
  return { ok: reasons.length === 0, reasons };
}

/** Avaliação (só leitura): o que falta para cada canal poder ser ligado. */
export function evaluateChannel(channel: PublishChannel): { channel: PublishChannel; status: 'desactivado'; missing: string[] } {
  if (channel === 'instagram') {
    return {
      channel, status: 'desactivado',
      missing: [
        'Ligação oficial da conta Instagram (Meta) — por fazer.',
        'Permissões de publicação e token — por decidir com a dona.',
        'Teste de publicação em conta de testes — por fazer.',
      ],
    };
  }
  return {
    channel, status: 'desactivado',
    missing: [
      'Conta Composio — por criar (decisão da dona).',
      'Avaliação de custos/limites do Composio — por fazer.',
      'Mapeamento das acções (publicar/agendar/métricas) — por fazer.',
    ],
  };
}
