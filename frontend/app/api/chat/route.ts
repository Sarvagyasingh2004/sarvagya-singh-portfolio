import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env, flags } from "@/lib/server/env";
import { connectDb, dbReady } from "@/lib/server/db";
import { ChatMessage } from "@/lib/server/models";
import { clientIp, hashIp, json, rateLimit } from "@/lib/server/util";
import { SYSTEM_PREAMBLE, loadCorpus, looksLowConfidence } from "@/lib/server/corpus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const body = z.object({
  message: z.string().trim().min(1).max(1000),
  sessionId: z.string().trim().min(1).max(64),
  history: z
    .array(z.object({ role: z.enum(["user", "model"]), text: z.string().max(4000) }))
    .max(20)
    .optional()
    .default([]),
});

export async function POST(req: Request) {
  if (!flags.chat) {
    return json({ error: "The assistant is unavailable. Please use the contact form." }, 503);
  }

  const ip = clientIp(req);
  if (!rateLimit(`chat:${ip}`, 15, 60 * 60 * 1000).ok) {
    return json({ error: "Too many messages. Please try again later." }, 429);
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request." }, 400);

  const { message, sessionId, history } = parsed.data;
  const ipHash = hashIp(ip);

  const ai = new GoogleGenAI({ apiKey: env.geminiKey });
  const systemInstruction = SYSTEM_PREAMBLE + (await loadCorpus());

  const contents = [...history, { role: "user" as const, text: message }].map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const encoder = new TextEncoder();
  let full = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

      try {
        const result = await ai.models.generateContentStream({
          model: env.geminiModel,
          contents,
          config: { systemInstruction, maxOutputTokens: 1024, temperature: 0.3 },
        });

        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            full += text;
            send("delta", { text });
          }
        }
        send("done", { text: full });
      } catch (err) {
        console.error("[chat]", (err as Error).message);
        send("error", { message: "Something went wrong generating that answer." });
      } finally {
        controller.close();
      }

      // Logged after the stream closes so it never delays the response.
      if (full && (await connectDb()) && dbReady()) {
        ChatMessage.insertMany([
          { sessionId, role: "user", text: message, ipHash },
          { sessionId, role: "model", text: full, ipHash, lowConfidence: looksLowConfidence(full) },
        ]).catch((e) => console.error("[chat] log", e.message));
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
