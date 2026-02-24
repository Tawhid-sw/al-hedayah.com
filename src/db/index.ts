import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema/auth-schema";

export const getDb = ({ DATABASE_URL }: { DATABASE_URL: string }) => {
  const pool = new Pool({ connectionString: DATABASE_URL! });
  const db = drizzle(pool, { schema });
  return db;
};
