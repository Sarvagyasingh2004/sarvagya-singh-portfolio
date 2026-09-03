import { Router } from "express";
import { z } from "zod";
import { writeLimiter } from "../middleware/limits.js";
import { isDbConnected } from "../lib/db.js";
import { Contact } from "../models/index.js";
import { hashIp } from "../lib/hash.js";

const router = Router();

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
  // Honeypot: bots fill hidden fields, humans don't.
  company_url: z.string().max(0).optional(),
});

router.post("/", writeLimiter, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please check the form and try again." });
  }

  const { name, email, message, company_url } = parsed.data;
  if (company_url) return res.status(204).end(); // silently drop bots

  if (!isDbConnected()) {
    console.log("[contact] (no DB) submission from", email);
    return res.status(202).json({ ok: true, stored: false });
  }

  await Contact.create({ name, email, message, ipHash: hashIp(req.ip) });
  res.status(201).json({ ok: true, stored: true });
});

export default router;
