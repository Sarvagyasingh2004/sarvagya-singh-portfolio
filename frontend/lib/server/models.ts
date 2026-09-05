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

// The resume PDF itself, stored as bytes.
//
// It cannot live in the repository: it carries a phone number, and the
// repository is public. It cannot be a Vercel environment variable either -
// base64 of a 216KB PDF is ~290KB and Vercel caps all env vars at 64KB
// combined. Mongo is already connected and a document holds up to 16MB, so
// the file goes where the rest of the site's state already lives.
const resumeFile = new Schema(
  {
    slug: { type: String, unique: true, index: true },
    data: Buffer,
    contentType: { type: String, default: "application/pdf" },
    bytes: Number,
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chat);
export const ResumeFile = mongoose.models.ResumeFile || mongoose.model("ResumeFile", resumeFile);
export const Event = mongoose.models.Event || mongoose.model("Event", event);
export const Contact = mongoose.models.Contact || mongoose.model("Contact", contact);
export const ResumeGrant = mongoose.models.ResumeGrant || mongoose.model("ResumeGrant", resumeGrant);
