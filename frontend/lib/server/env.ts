export const env = {
  geminiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  chatEnabled: process.env.CHATBOT_ENABLED !== "false",
  mongoUri: process.env.MONGODB_URI ?? "",
  ipSalt: process.env.IP_HASH_SALT ?? "dev-only-change-in-prod",
  resendKey: process.env.RESEND_API_KEY ?? "",
  notifyEmail: process.env.NOTIFY_EMAIL ?? "",
  fromEmail: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
  cronSecret: process.env.CRON_SECRET ?? "",
};

export const flags = {
  chat: Boolean(env.geminiKey) && env.chatEnabled,
  db: Boolean(env.mongoUri),
  email: Boolean(env.resendKey && env.notifyEmail),
};
