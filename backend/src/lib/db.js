import mongoose from "mongoose";
import { config, featureFlags } from "./config.js";

let connected = false;

export async function connectDb() {
  if (!featureFlags.persistence) {
    console.warn(
      "[db] MONGODB_URI not set — running without persistence. " +
        "Chat logs, events and contacts will not be stored."
    );
    return false;
  }

  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    console.log("[db] connected to MongoDB");
    return true;
  } catch (err) {
    // A dead database must not take the API down — the chatbot still works.
    console.error("[db] connection failed, continuing without it:", err.message);
    return false;
  }
}

export const isDbConnected = () => connected && mongoose.connection.readyState === 1;
