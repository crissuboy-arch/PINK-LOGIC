/**
 * Geração server-side — reaproveita os motores reais do PINK-LOGIC.
 *
 * logo/sticker: Pollinations.ai (HTTP direto, grátis) — mesma fonte do web.
 * qrcode: api.qrserver.com (HTTP direto, grátis).
 * story/copy: via AIsa quando configurada; senão 503 (não mock).
 * carousel/mockup com options.store=true: o PNG é guardado no Storage
 * e a resposta traz imageUrl em vez de imageBase64 — sem isto, o GPT
 * não consegue receber o PNG (a resposta rebenta o limite de ~100K
 * caracteres das Actions).
 */
import { GenerateModule } from "@pink-logic/shared";
import { generateText, aisaReady } from "./aisa.js";

export async function generate(module: GenerateModule, prompt: string, options: Record<string, unknown> = {}) {
  switch (module) {
    case "logo": {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`;
      return { module, imageUrl, metadata: { provider: "pollinations" } };
    }
    case "sticker": {
      // Figurinha "die-cut": estilo + cores da marca + semente (para variações).
      const STYLES: Record<string, string> = {
        kawaii: "kawaii chibi cartoon, big sparkly eyes, pastel colors, super cute",
        retro: "retro 90s cartoon sticker, bold outlines, halftone dots, vibrant",
        neon: "neon glow sticker, dark outline, electric colors, cyber cute",
        "3d": "glossy 3D render sticker, soft shadows, playful clay look",
        meme: "funny expressive meme sticker, exaggerated face, thick outline",
        watercolor: "hand painted watercolor sticker, soft edges, whimsical",
        pixel: "pixel art sticker, 8-bit, crisp pixels, fun",
        graffiti: "street graffiti sticker, bold lettering, spray paint, urban",
      };
      const style = STYLES[String(options.style)] ?? STYLES.kawaii;
      const colors = Array.isArray(options.colors) ? (options.colors as string[]).slice(0, 3).join(", ") : "";
      const seed = Number.isFinite(Number(options.seed)) ? Number(options.seed) : Math.floor(Math.random() * 1e6);
      const full = `${prompt}, ${style}, die-cut sticker design, thick white border, centered, isolated on plain white background, flat vector illustration, no text${colors ? `, color palette ${colors}` : ""}`;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?nologo=true&width=768&height=768&seed=${seed}`;
      return { module, imageUrl, metadata: { provider: "pollinations", style: String(options.style || "kawaii"), seed } };
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
      if (options.mode === "content") {
        const { generateCarouselContent } = await import("./carousel-content.js");
        return generateCarouselContent({ ...options, topic: prompt });
      }
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
      if (options.store === true) {
        const { storeImage } = await import("./media.js");
        const stored = await storeImage(png, "image/png", `carousel-slide-${slideNumber || "1"}.png`);
        return { module, imageUrl: stored.url, metadata: { renderer: "hybrid", style: "maestro", stored: true, path: stored.path } };
      }
      return { module, imageBase64: png.toString("base64"), metadata: { renderer: "hybrid", style: "maestro" } };
    }
    case "mockup": {
      // Renderer de mockups: mesmos 9 tipos do Mockup Studio web.
      const { renderMockup, resolveArtwork, isValidMockupType } = await import("./mockup-render.js");
      const mockupType = options.mockupType as string;
      const artworkUrl = options.artworkUrl as string;
      if (!isValidMockupType(mockupType)) {
        const err: any = new Error(`tipo de mockup inválido: ${mockupType}`);
        err.status = 400;
        throw err;
      }
      const artwork = await resolveArtwork(artworkUrl);
      const png = await renderMockup({
        type: mockupType,
        artworkUrl: artwork,
        projectName: options.projectName as string | undefined,
      });
      if (options.store === true) {
        const { storeImage } = await import("./media.js");
        const stored = await storeImage(png, "image/png", `mockup-${mockupType}.png`);
        return {
          module,
          imageUrl: stored.url,
          metadata: { renderer: "satori", mockupType, idempotencyKey: options.idempotencyKey ?? null, stored: true, path: stored.path },
        };
      }
      return {
        module,
        imageBase64: png.toString("base64"),
        metadata: { renderer: "satori", mockupType, idempotencyKey: options.idempotencyKey ?? null },
      };
    }
  }
}
