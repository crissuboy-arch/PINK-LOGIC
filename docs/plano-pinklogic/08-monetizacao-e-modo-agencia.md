# 08 — Monetização e Modo Agência

## 8.1 Planos (sugestão inicial — ajustar com seu custo real de IA)
| Plano | Público | Marcas | Créditos/mês | Extras |
|---|---|---|---|---|
| Grátis | Teste | 1 | 50 | Marca d'água, 3 exportações/dia |
| Criador | Freelancer | 3 | 1.000 | Sem marca d'água, QR dinâmico (10) |
| Pro | Pequena agência | 10 | 5.000 | Publicador, agentes, relatórios PDF |
| Agência | Agência | 30+ | 20.000 | Aprovação por link, equipe, white-label |

Preços: validar por mercado (BRL, EUR, USD) depois de medir o custo médio por crédito.

## 8.2 Créditos
- Tabela `credit_ledger(id, user_id, delta, reason, ref_id, created_at)` (lançamentos, nunca editar saldo direto).
- Tabela de custos por ação (copy = 1, imagem = 5, logo = 8, carrossel = 10...).
- Mostrar custo antes de executar e saldo no topo.
- Falha do provedor devolve o crédito automaticamente.
- Compra de créditos extras ("Comprar mais créditos" já existe no Painel).
- Alertas em 80% e 100% de uso.

## 8.3 Cobrança
- Stripe Checkout + Customer Portal (cartão, Apple/Google Pay; Pix e boleto via Stripe no Brasil).
- Opcional para o mercado BR: Hotmart/Kiwify/Cakto com webhook liberando o plano.
- Webhooks: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`.
- Teste sempre em modo de teste antes de ligar o modo real; cobrança real só com sua revisão final.

## 8.4 Modo Agência
- Espaço de trabalho com várias marcas (clientes), cada uma com Brand Kit, ativos, calendário e redes.
- Papéis: Dono, Designer, Redator, Cliente (somente aprovar).
- **Aprovação por link:** cliente abre página pública (sem login), vê o post, aprova ou pede ajuste com comentário.
- Relatório PDF mensal por cliente (logo, resultados, próximos passos).
- White-label: domínio e logo próprios no plano Agência.

## 8.5 Kit de campanha em 1 clique
Entrada: produto + objetivo + verba. Saída: copy, 3 posts, 1 carrossel, 1 story, QR Code, calendário de 14 dias e texto de anúncio Meta (rascunho/pausado).

## 8.6 Métricas do próprio produto
- Ativação (marca criada + 1 post exportado em 24 h), retenção semanal, créditos por usuário, taxa de conversão grátis → pago, custo de IA por usuário.
- Ferramenta: PostHog ou similar.
