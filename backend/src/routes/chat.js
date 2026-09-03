import { Router } from "express";
import { z } from "zod";
import { chatLimiter } from "../middleware/limits.js";
import { streamReply, looksLowConfidence } from "../services/gemini.js";
import { featureFlags } from "../lib/config.js";
import { isDbConnected } from "../lib/db.js";
import { ChatMessage } from "../models/index.js";
import { hashIp } from "../lib/hash.js";

const router = Router();

const bodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  sessionId: z.string().trim().min(1).max(64),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().max(4000),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

router.post("/", chatLimiter, async (req, res) => {
  if (!featureFlags.chat) {
    return res.status(503).json({
      error: "The assistant is unavailable right now. Please use the contact form.",
    });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request.", detail: parsed.error.issues });
  }

  const { message, sessionId, history } = parsed.data;
  const ipHash = hashIp(req.ip);

  // Server-Sent Events. Nginx must have proxy_buffering off for this to
  // stream rather than arrive all at once.
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let full = "";

  try {
    const stream = await streamReply({ history, message });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        full += text;
        send("delta", { text });
      }
    }

    send("done", { text: full });
  } catch (err) {
    console.error("[chat] generation failed:", err.message);
    send("error", {
      message: "Something went wrong generating that answer. Please try again.",
    });
  } finally {
    res.end();
  }

  if (isDbConnected() && full) {
    ChatMessage.insertMany([
      { sessionId, role: "user", text: message, ipHash },
      {
        sessionId,
        role: "model",
        text: full,
        ipHash,
        lowConfidence: looksLowConfidence(full),
      },
    ]).catch((e) => console.error("[chat] log failed:", e.message));
  }
});

export default router;
