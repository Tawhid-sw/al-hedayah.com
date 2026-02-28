import { createServerFn } from "@tanstack/react-start";
import { auth } from "./auth";
import { withAuthHandler } from "./auth-handler";
import { isRedirect, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import * as z from "zod";
import { getDb } from "@/db/index";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { authMiddleware, ownerOnlyMiddleware } from "./middleware";

// --- PUBLIC ACTIONS ---

// Sign in
export const signIn = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Invalid form data");
    return {
      email: (data.get("email") as string) || "",
      password: (data.get("password") as string) || "",
    };
  })
  .handler(({ data }) =>
    withAuthHandler(() => auth.api.signInEmail({ body: data })),
  );

// Sign up
export const signUp = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Invalid form data");
    return {
      name: (data.get("name") as string) || "",
      email: (data.get("email") as string) || "",
      password: (data.get("password") as string) || "",
    };
  })
  .handler(({ data }) =>
    withAuthHandler(() => auth.api.signUpEmail({ body: data })),
  );

// Sign out
export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const request = getRequest();
  try {
    await auth.api.signOut({ headers: request.headers });
  } catch (error) {
    if (isRedirect(error)) throw error;
  }
  throw redirect({ to: "/auth/sign-in" });
});

// Sign In with Google
export const signInWithGoogle = createServerFn({ method: "POST" }).handler(
  async () => {
    return await withAuthHandler(async () => {
      return await auth.api.signInSocial({
        body: {
          provider: "google",
          callbackURL: "/dashboard",
        },
      });
    });
  },
);

// Request password reset
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.email() }))
  .handler(async ({ data }) => {
    const db = getDb({ DATABASE_URL: process.env.DATABASE_URL! });
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, data.email))
      .limit(1);

    if (!existingUser) return { error: "User not found" };

    return withAuthHandler(() =>
      auth.api.requestPasswordReset({
        body: { email: data.email, redirectTo: "/auth/set-new-password" },
      }),
    );
  });

// Perform password reset
export const performPasswordReset = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      password: z.string().min(8),
      token: z.string(),
    }),
  )

  .handler(({ data }) =>
    withAuthHandler(() =>
      auth.api.resetPassword({
        body: {
          newPassword: data.password,

          token: data.token,
        },
      }),
    ),
  );

// Change password
export const changePassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
      revokeOtherSessions: z.boolean().optional().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    return await withAuthHandler(() =>
      auth.api.changePassword({
        body: data,
        headers: request.headers,
      }),
    );
  });

// --- OWNER ONLY ACTIONS ---

// Strictly protected: Only users with role 'owner' can create an organization
export const createOrganizationByOwner = createServerFn({ method: "POST" })
  .middleware([ownerOnlyMiddleware])
  .inputValidator(
    z.object({
      name: z.string().min(2),
      slug: z.string().min(2).toLowerCase(),
      logo: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const request = getRequest();
    return await withAuthHandler(async () => {
      return await auth.api.createOrganization({
        body: { ...data, userId: context.user.id },
        headers: request.headers,
      });
    });
  });

// Strictly protected: Only owners can register new admins
export const createAdminByOwner = createServerFn({ method: "POST" })
  .middleware([ownerOnlyMiddleware])
  .inputValidator(
    z.object({
      name: z.string().min(2),
      email: z.email(),
      password: z.string().min(8),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();

    const userOrgs = await auth.api.listOrganizations({
      headers: request.headers,
    });
    const orgId = userOrgs[0]?.id;

    if (!orgId) throw new Error("Owner organization not found");

    const newUser = await auth.api.signUpEmail({
      body: { email: data.email, password: data.password, name: data.name },
    });

    await auth.api.addMember({
      body: {
        organizationId: orgId,
        userId: newUser.user.id,
        role: "admin",
      },
      headers: request.headers,
    });

    return { success: true };
  });
