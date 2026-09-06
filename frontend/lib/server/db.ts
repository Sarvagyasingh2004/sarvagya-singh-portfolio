import mongoose from "mongoose";
import { env, flags } from "./env";

// Serverless functions are recycled constantly, so the connection is cached on
// globalThis. Without this every invocation opens a new pool and Atlas M0
// (500 connection cap) runs out fast.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: Promise<typeof mongoose> | undefined;
}

const open = () =>
  mongoose.connect(env.mongoUri, {
    // A cold function and a cold M0 need more than eight seconds between
    // continents: TLS, SCRAM auth and topology discovery are several round
    // trips each. Falling short here surfaced as an intermittent
    // "Resume not available" on the deployed site.
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 20000,
    maxPoolSize: 5,
  });

export async function connectDb() {
  if (!flags.db) return false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      if (!global._mongoose) global._mongoose = open();
      await global._mongoose;
      return true;
    } catch (err) {
      // Drop the cached promise so the retry actually dials again rather than
      // awaiting the same rejected one.
      global._mongoose = undefined;
      if (attempt === 1) {
        // A dead database must never take the site down.
        console.error("[db]", (err as Error).message);
        return false;
      }
    }
  }
  return false;
}

export const dbReady = () => mongoose.connection.readyState === 1;
