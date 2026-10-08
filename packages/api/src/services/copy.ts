/**
 * Gerador de Copy — PinkLogic.
 *
 * Fluxo (secção 8 das diretrizes):
 *   1. System prompt (copy-system.md) + briefing → AIsa
 *   2. Checagem automática (blocklist + checklist)
 *   3. Se reprovar → regenera 1x com instrução de correção
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateTextWithSystem, aisaReady } from "./aisa.js";
import { checkCopy } from "./copy-check.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Erro legível quando a IA estoura o tempo (a AIsa corta conexões em ~60s). */
function friendlyAiError(e: any): Error {
  const msg = String(e?.message || "");
  if (/terminated|timeout|timed out|HTTP 504|aborted|ECONNRESET/i.test(msg)) {
    const err: any = new Error("A IA demorou demais para responder. Tente novamente.");
    err.status = 504;
    return err;
  }
  return e;
}

/** Tempo máximo da 1ª geração para ainda caber uma reescrita dentro do limite da função (vercel.json). */
const REGEN_BUDGET_MS = 90_000;

let systemPrompt: string | null = null;
function loadSystemPrompt(): string {
  if (!systemPrompt) {
    // Tenta vários locais: dist (build), src (dev) e raiz do monorepo (Vercel).
    const candidates = [
      join(__dirname, "..", "prompts", "copy-system.md"),
      join(process.cwd(), "packages", "api", "dist", "prompts", "copy-system.md"),
      join(process.cwd(), "packages", "api", "src", "prompts", "copy-system.md"),
    ];
    const found = candidates.find((p) => existsSync(p));
    if (!found) throw new Error("copy-system.md não encontrado no deploy (verifica includeFiles no vercel.json)");
    systemPrompt = readFileSync(found, "utf-8");
  }
  return systemPrompt;
}

export interface CopyBriefing {
  prompt: string; // tema/produto em texto livre
  brand?: string;
  product?: string;
  audience?: string;
  pain?: string;
  desire?: string;
  objection?: string;
  objective?: string; // vender | engajar | captar lead | educar
  format?: string; // legenda | headline | roteiro reels | anúncio meta | email | whatsapp
  language?: string; // PT-BR | PT-PT | EN | ES | FR
  framework?: string; // AIDA | PAS | BAB | 4Ps | storytelling
}

function buildUserMessage(b: CopyBriefing): string {
  const lines = [`Tema/produto: ${b.prompt}`];
  if (b.brand) lines.push(`Marca: ${b.brand}`);
  if (b.product) lines.push(`Oferta: ${b.product}`);
  if (b.audience) lines.push(`Público: ${b.audience}`);
  if (b.pain) lines.push(`Dor principal: ${b.pain}`);
  if (b.desire) lines.push(`Desejo principal: ${b.desire}`);
  if (b.objection) lines.push(`Objeção principal: ${b.objection}`);
  if (b.objective) lines.push(`Objetivo: ${b.objective}`);
  if (b.format) lines.push(`Formato: ${b.format}`);
  if (b.language) lines.push(`Idioma: ${b.language}`);
  if (b.framework) lines.push(`Framework: ${b.framework}`);
  return `BRIEFING\n${lines.join("\n")}\n\nGera a peça seguindo as regras do formato (secção 4) e o formato de entrega (secção 5). Faz a autochecagem (secção 6) antes de responder.`;
}

export async function generateCopy(briefing: CopyBriefing) {
  if (!aisaReady()) {
    const err: any = new Error("Copy real precisa de AIsa: define AISA_API_KEY (o mock foi removido)");
    err.status = 503;
    throw err;
  }
  const system = loadSystemPrompt();
  const user = buildUserMessage(briefing);

  const t0 = Date.now();
  let text: string;
  try {
    text = await generateTextWithSystem(system, user);
  } catch (e: any) {
    throw friendlyAiError(e);
  }
  const firstMs = Date.now() - t0;
  if (!text.trim()) {
    // Nunca devolver "sucesso" em branco: o usuário precisa ver que falhou.
    const err: any = new Error("A IA não devolveu texto. Tente gerar novamente.");
    err.status = 502;
    throw err;
  }
  let check = checkCopy(text, briefing.format);
  let regenerated = false;

  // A função tem 300s (vercel.json). Só reescreve se a 1ª geração deixou tempo para uma 2ª;
  // senão devolve a 1ª versão com o aviso "Revisar" em vez de estourar o tempo (504).
  if (!check.passed && firstMs < REGEN_BUDGET_MS) {
    regenerated = true;
    // Se a reescrita falhar (ex.: tempo esgotado), mantém a primeira versão com o aviso de revisão.
    const retry = await generateTextWithSystem(
      system,
      `${user}\n\nATENÇÃO: a versão anterior foi REPROVADA na checagem automática por: ${check.violations.join("; ")}. Reescreve eliminando TODAS as violações, mantendo a estrutura AIDA/PAS e o formato de entrega.`
    ).catch(() => "");
    // Se a reescrita vier vazia, mantém a primeira versão (com o aviso de revisão).
    if (retry.trim()) {
      text = retry;
      check = checkCopy(text, briefing.format);
    }
  }

  return {
    module: "copy",
    text,
    metadata: {
      provider: "aisa",
      check: check.passed ? "passed" : "failed",
      violations: check.violations,
      regenerated,
      firstMs,
      totalMs: Date.now() - t0,
    },
  };
}
