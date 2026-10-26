/**
 * Estado de aprovação de um post para a UI — função pura, sem React nem rede.
 *
 * Entrada: o post já mapeado para a UI (status em inglês, como o
 * PublisherContext o expõe) + os campos de aprovação vindos da base
 * (approvedAt, decision). A correspondência com o modelo da API:
 * draft = rascunho, scheduled = agendado, published = publicado,
 * failed = falhou, publishing = publicando (transitório, reivindicado
 * pelo cron), cancelled = cancelado.
 *
 * Regra de precedência (um post mostra UM estado, inequívoco, e a ordem
 * abaixo é a ordem de avaliação):
 *  1. Publicado — status published. Ganha a tudo: um post publicado
 *     continua Publicado mesmo que a decisão mude depois.
 *  2. Bloqueado — failed/cancelled, OU decision.passed === false (o Jev
 *     reprovou). É o único estado que a aprovação humana NÃO desbloqueia:
 *     o gate do servidor (canPublishPost) recusa estes posts mesmo com
 *     approved_at preenchido. Para voltar a publicar é preciso rever o
 *     conteúdo e reagendar (o que reavalia o Jev).
 *  3. Agendado — scheduled + approvedAt: elegível, aguarda a sua janela
 *     (o cron publica quando vencer). O estado transitório publishing
 *     (post reivindicado pelo cron, publicação em curso) mostra-se
 *     também como Agendado, porque foi aprovado e agendado.
 *  4. Aprovado — draft + approvedAt: aprovado, ainda não agendado.
 *     É isto que distingue Aprovado de Agendado: a aprovação sem
 *     agendamento não publica nada.
 *  5. Pendente de aprovação — scheduled sem approvedAt: agendado mas sem
 *     aprovação, por isso NÃO sai na janela. Falta-lhe exatamente uma
 *     ação: a aprovação humana. (Não é Bloqueado: nada está errado, só
 *     falta aprovar — ao contrário do Jev reprovado, que a aprovação
 *     não resolve.)
 *  6. Rascunho — draft sem approvedAt: rascunho, sem agendamento nem
 *     aprovação.
 *  Qualquer estado desconhecido cai em Bloqueado (fail-closed na
 *  exibição: nunca mostrar um estado desconhecido como publicável).
 */

export type ApprovalDisplayState =
  | 'rascunho'
  | 'pendente'
  | 'aprovado'
  | 'agendado'
  | 'publicado'
  | 'bloqueado';

export interface ApprovalPostInput {
  status: string;
  approvedAt?: string | null;
  decision?: { passed?: boolean } | null;
}

export const APPROVAL_STATE_LABELS: Record<ApprovalDisplayState, string> = {
  rascunho: 'Rascunho',
  pendente: 'Pendente de aprovação',
  aprovado: 'Aprovado',
  agendado: 'Agendado',
  publicado: 'Publicado',
  bloqueado: 'Bloqueado',
};

/** Classe CSS da pílula de estado (ver PublicadorAutomatico). */
export const APPROVAL_STATE_PILL_CLASS: Record<ApprovalDisplayState, string> = {
  rascunho: 'status-pill draft',
  pendente: 'status-pill pending',
  aprovado: 'status-pill approved',
  agendado: 'status-pill scheduled',
  publicado: 'status-pill posted',
  bloqueado: 'status-pill failed',
};

export function getPostApprovalState(post: ApprovalPostInput): ApprovalDisplayState {
  if (post.status === 'published') return 'publicado';
  if (post.status === 'failed' || post.status === 'cancelled') return 'bloqueado';
  if (post.decision && post.decision.passed === false) return 'bloqueado';
  if (post.status === 'publishing') return 'agendado';
  if (post.status === 'scheduled' && post.approvedAt) return 'agendado';
  if (post.status === 'draft' && post.approvedAt) return 'aprovado';
  if (post.status === 'scheduled') return 'pendente';
  if (post.status === 'draft') return 'rascunho';
  return 'bloqueado';
}

export type ApproveButtonState = 'hidden' | 'enabled' | 'disabled-jev';

/**
 * Visibilidade do botão de aprovação humana.
 * - hidden: não é a proprietária (a UI esconde; o servidor continua a
 *   ser quem impõe — requireOwner dá 403/503), ou o post já está
 *   aprovado, publicado, falhou, foi cancelado ou está a publicar.
 * - disabled-jev: é a proprietária e o post aguarda aprovação, mas o Jev
 *   reprovou-o — a aprovação não o desbloquearia, por isso o botão
 *   mostra-se desativado com a explicação (nunca uma ação enganadora).
 * - enabled: é a proprietária, o post é rascunho/agendado, sem aprovação
 *   e sem reprovação do Jev.
 */
export function getApproveButtonState(
  post: ApprovalPostInput,
  isOwner: boolean,
): ApproveButtonState {
  if (!isOwner) return 'hidden';
  if (post.approvedAt) return 'hidden';
  if (
    post.status === 'published' ||
    post.status === 'failed' ||
    post.status === 'cancelled' ||
    post.status === 'publishing'
  ) {
    return 'hidden';
  }
  if (post.status !== 'draft' && post.status !== 'scheduled') return 'hidden';
  if (post.decision && post.decision.passed === false) return 'disabled-jev';
  return 'enabled';
}
