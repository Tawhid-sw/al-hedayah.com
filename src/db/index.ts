import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./auth-schema";
import { serverEnv } from "@/lib/server-env";
import { Pool } from "@neondatabase/serverless";

if (!serverEnv.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
  ssl: serverEnv.DATABASE_URL?.includes("neondb")
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

export const db = drizzle(pool, { schema });
