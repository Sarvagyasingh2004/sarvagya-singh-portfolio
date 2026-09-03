import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const chatMessageSchema = new Schema(
  {
    sessionId: { type: String, index: true },
    role: { type: String, enum: ["user", "model"] },
    text: String,
    lowConfidence: { type: Boolean, default: false },
    ipHash: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

const eventSchema = new Schema(
  {
    type: { type: String, index: true },
    path: String,
    meta: Schema.Types.Mixed,
    sessionId: String,
    ipHash: String,
    referrer: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

const contactSchema = new Schema(
  {
    name: String,
    email: String,
    message: String,
    ipHash: String,
    notified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

const resumeGrantSchema = new Schema(
  {
    role: String,
    scope: String,
    ipHash: String,
    referrer: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

export const ChatMessage = models.ChatMessage || model("ChatMessage", chatMessageSchema);
export const Event = models.Event || model("Event", eventSchema);
export const Contact = models.Contact || model("Contact", contactSchema);
export const ResumeGrant = models.ResumeGrant || model("ResumeGrant", resumeGrantSchema);
