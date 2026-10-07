/**
 * Geração server-side — reaproveita os motores reais do PINK-LOGIC.
 *
 * logo/sticker: Pollinations.ai (HTTP direto, grátis) — mesma fonte do web.
 * qrcode: api.qrserver.com (HTTP direto, grátis).
 * story/copy: via AIsa quando configurada; senão 503 (não mock).
 */
import { GenerateModule } from "@pink-logic/shared";
import { generateText, aisaReady } from "./aisa.js";

export async function generate(module: GenerateModule, prompt: string, options: Record<string, unknown> = {}) {
  switch (module) {
    case "logo":
    case "sticker": {
      // Pollinations: GET https://image.pollinations.ai/prompt/{prompt}
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`;
      return { module, imageUrl, metadata: { provider: "pollinations" } };
    }
    case "qrcode": {
      const data = encodeURIComponent(prompt);
      const size = (options.size as string) || "512x512";
      const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${data}&size=${size}`;
      return { module, imageUrl, metadata: { provider: "qrserver" } };
    }
    case "copy": {
      // Gerador de Copy: system prompt + blocklist + regeneração 1x
      const { generateCopy } = await import("./copy.js");
      return generateCopy({
        prompt,
        brand: options.brand as string | undefined,
        product: options.product as string | undefined,
        audience: options.audience as string | undefined,
        pain: options.pain as string | undefined,
        desire: options.desire as string | undefined,
        objection: options.objection as string | undefined,
        objective: options.objective as string | undefined,
        format: options.format as string | undefined,
        language: options.language as string | undefined,
        framework: options.framework as string | undefined,
      });
    }
    case "story": {
      const err: any = new Error("Story server-side ainda não implementado — usa o web (canvas no browser)");
      err.status = 501;
      throw err;
    }
    case "carousel": {
      // Renderer híbrido: texto pixel-perfect via Satori+resvg.
      // Para direção de arte IA pura, usar options.mode="art".
      const { renderSlide } = await import("./carousel-render.js");
      const slideNumber = options.slideNumber as string | undefined;
      const png = await renderSlide({
        title: prompt,
        items: (options.items as string[]) || [],
        footer: options.footer as string | undefined,
        handle: (options.handle as string) || "",
        counter: slideNumber || "",
      });
      return { module, imageBase64: png.toString("base64"), metadata: { renderer: "hybrid", style: "maestro" } };
    }
  }
}
