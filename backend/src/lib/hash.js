import { createHash } from "node:crypto";
import { config } from "./config.js";

// Store a salted hash, never the raw address. Gives unique-visitor counts
// without retaining PII.
export const hashIp = (ip) =>
  createHash("sha256")
    .update(`${config.ipHashSalt}:${ip || "unknown"}`)
    .digest("hex")
    .slice(0, 32);
