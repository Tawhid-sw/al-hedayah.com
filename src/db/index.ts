import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./auth-schema";
import { serverEnv } from "@/lib/server-env";

export const db = drizzle(serverEnv.DATABASE_URL, { schema });
