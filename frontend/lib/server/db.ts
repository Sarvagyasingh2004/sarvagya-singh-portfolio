import mongoose from "mongoose";
import { env, flags } from "./env";

// Serverless functions are recycled constantly, so the connection is cached on
// globalThis. Without this every invocation opens a new pool and Atlas M0
// (500 connection cap) runs out fast.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: Promise<typeof mongoose> | undefined;
}

export async function connectDb() {
  if (!flags.db) return false;
  try {
    if (!global._mongoose) {
      global._mongoose = mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 5,
      });
    }
    await global._mongoose;
    return true;
  } catch (err) {
    // A dead database must never take the site down.
    console.error("[db]", (err as Error).message);
    global._mongoose = undefined;
    return false;
  }
}

export const dbReady = () => mongoose.connection.readyState === 1;
