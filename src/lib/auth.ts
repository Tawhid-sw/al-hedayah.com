import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import { serverEnv } from "./server-env.ts";

export const auth = betterAuth({
  secret: serverEnv.BETTER_AUTH_SECRET!,
  baseURL: serverEnv.BETTER_AUTH_URL!,
  cookies: {
    secure: true,
    sameSite: "lax",
  },
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID!,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [tanstackStartCookies()],
});
export type Auth = typeof auth;
