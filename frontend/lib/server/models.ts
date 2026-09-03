import mongoose, { Schema } from "mongoose";

const chat = new Schema(
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

const event = new Schema(
  {
    type: { type: String, index: true },
    path: String,
    meta: Schema.Types.Mixed,
    ipHash: String,
    referrer: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

const contact = new Schema(
  {
    name: String,
    email: String,
    message: String,
    ipHash: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

const resumeGrant = new Schema(
  {
    ipHash: String,
    referrer: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chat);
export const Event = mongoose.models.Event || mongoose.model("Event", event);
export const Contact = mongoose.models.Contact || mongoose.model("Contact", contact);
export const ResumeGrant = mongoose.models.ResumeGrant || mongoose.model("ResumeGrant", resumeGrant);
