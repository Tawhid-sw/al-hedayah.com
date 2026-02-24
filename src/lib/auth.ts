import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDb } from "@/db"; // your drizzle instance

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.AUTH_BASE_URL!,
  database: drizzleAdapter(getDb({ DATABASE_URL: process.env.DATABASE_URL! }), {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [tanstackStartCookies()],
});
