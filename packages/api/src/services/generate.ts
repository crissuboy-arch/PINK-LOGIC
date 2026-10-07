/**
 * Geração server-side — reaproveita os motores reais do PINK-LOGIC.
 *
 * logo/sticker: Pollinations.ai (HTTP direto, grátis) — mesma fonte do web.
 * qrcode: api.qrserver.com (HTTP direto, grátis).
 * story/copy: via AIsa quando configurada; senão 503 (não mock).
 */
import { GenerateModule } from "@pink-logic/shared";
import { generateText, aisaReady } from "./aisa.js";
import { buildCarouselPrompt, type CarouselStyle } from "./carousel-styles.js";

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
      if (!aisaReady()) {
        const err: any = new Error("Copy real precisa de AIsa: define AISA_API_KEY (o mock foi removido)");
        err.status = 503;
        throw err;
      }
      const text = await generateText(
        `Escreve uma legenda de Instagram em pt-BR para: ${prompt}. Inclui CTA e hashtags.`
      );
      return { module, text, metadata: { provider: "aisa" } };
    }
    case "story": {
      const err: any = new Error("Story server-side ainda não implementado — usa o web (canvas no browser)");
      err.status = 501;
      throw err;
    }
    case "carousel": {
      // Estilo via Pollinations (grátis). Texto longo em PT pode sair com
      // gralhas — para texto pixel-perfect, usar overlay HTML no futuro.
      const style = (options.style as CarouselStyle) || "maestro";
      const slideNumber = options.slideNumber as string | undefined;
      const fullPrompt = buildCarouselPrompt(style, prompt, slideNumber);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?nologo=true&width=1080&height=1080`;
      return { module, imageUrl, metadata: { provider: "pollinations", style } };
    }
  }
}
