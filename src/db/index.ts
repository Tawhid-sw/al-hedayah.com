import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./auth-schema";
import { serverEnv } from "@/lib/server-env";

const sql = neon(serverEnv.DATABASE_URL);
export const db = drizzle(sql, { schema });
