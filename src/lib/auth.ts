import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDb } from "@/db"; // your drizzle instance
import { Resend } from "resend";
import { organization } from "better-auth/plugins";
import * as schema from "@/db/schema/auth-schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.AUTH_BASE_URL!,
  database: drizzleAdapter(getDb({ DATABASE_URL: process.env.DATABASE_URL! }), {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Al-Hedayah <auth@al-hedayah.com>",
        to: [user.email],
        subject: "Reset your password",
        html: `
          <div>
            <h1>Reset your password</h1>
            <p>Click the link below to reset your password for Al-Hedayah:</p>
            <a href="${url}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  plugins: [
    tanstackStartCookies(),
    organization({
      allowUserToCreateOrganization: async (user) => {
        return user.role === "owner";
      },
    }),
  ],
});
