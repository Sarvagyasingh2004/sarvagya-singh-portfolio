const bool = (v, fallback = false) =>
  v === undefined ? fallback : /^(1|true|yes)$/i.test(v);

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    enabled: bool(process.env.CHATBOT_ENABLED, true),
  },
  mongoUri: process.env.MONGODB_URI || "",
  ipHashSalt: process.env.IP_HASH_SALT || "dev-only-change-in-prod",
  aws: {
    region: process.env.AWS_REGION || "ap-south-1",
    resumeBucket: process.env.RESUME_BUCKET || "",
    sesFrom: process.env.SES_FROM || "",
    notifyEmail: process.env.NOTIFY_EMAIL || "",
  },
};

export const featureFlags = {
  chat: Boolean(config.gemini.apiKey) && config.gemini.enabled,
  persistence: Boolean(config.mongoUri),
  resume: Boolean(config.aws.resumeBucket),
  email: Boolean(config.aws.sesFrom && config.aws.notifyEmail),
};
