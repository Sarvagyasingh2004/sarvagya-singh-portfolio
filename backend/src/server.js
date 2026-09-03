import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config, featureFlags } from "./lib/config.js";
import { connectDb, isDbConnected } from "./lib/db.js";
import { loadCorpus, corpusStats } from "./lib/corpus.js";
import chatRoutes from "./routes/chat.js";
import contactRoutes from "./routes/contact.js";
import eventRoutes from "./routes/events.js";
import resumeRoutes from "./routes/resume.js";

const app = express();

// Nginx sits in front in production, so read the real client IP from
// X-Forwarded-For — otherwise every request rate-limits as 127.0.0.1.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    credentials: false,
  })
);
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: config.nodeEnv,
    features: { ...featureFlags, dbConnected: isDbConnected() },
    model: featureFlags.chat ? config.gemini.model : null,
  });
});

app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/resume", resumeRoutes);

// Express 5: a bare "*" is no longer a valid path — splats must be named.
app.use("/*splat", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Express 5 forwards rejected promises here automatically.
app.use((err, req, res, next) => {
  console.error("[error]", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal server error" });
});

const start = async () => {
  await connectDb();

  if (featureFlags.chat) {
    const stats = corpusStats(await loadCorpus());
    console.log(
      `[corpus] ${stats.words} words / ~${stats.approxTokens} tokens loaded`
    );
  } else {
    console.warn("[chat] disabled — GEMINI_API_KEY missing or CHATBOT_ENABLED=false");
  }

  app.listen(config.port, "127.0.0.1", () => {
    console.log(`\n  portfolio-api listening on http://127.0.0.1:${config.port}`);
    console.log(`  health:  http://127.0.0.1:${config.port}/api/health`);
    console.log(`  features:`, featureFlags, "\n");
  });
};

start();
