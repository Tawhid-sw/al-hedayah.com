import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./auth-schema";
// import { serverEnv } from "@/lib/server-env";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neondb")
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

export const db = drizzle(pool, { schema });
