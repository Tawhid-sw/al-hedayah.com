import { createServerFn } from "@tanstack/react-start";
import { auth } from "./auth";
import { withAuthHandler } from "./auth-handler";
import { isRedirect, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import z from "zod";

// SignIn
export const signIn = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid form data");
    }
    return {
      email: (data.get("email") as string) || "",
      password: (data.get("password") as string) || "",
    };
  })
  .handler(({ data }) =>
    withAuthHandler(() => auth.api.signInEmail({ body: data })),
  );

// SignUp
export const signUp = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Invalid form data");
    }
    return {
      name: (data.get("name") as string) || "",
      email: (data.get("email") as string) || "",
      password: (data.get("password") as string) || "",
    };
  })
  .handler(({ data }) =>
    withAuthHandler(() => auth.api.signUpEmail({ body: data })),
  );

// SignOut
export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const request = getRequest();
  try {
    await auth.api.signOut({
      headers: request.headers,
    });
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error("Sign out error:", error);
  }

  throw redirect({ to: "/auth/signin" });
});

// SignIn with Google
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

// Request the reset email
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(({ data }) =>
    withAuthHandler(() =>
      auth.api.requestPasswordReset({
        body: {
          email: data.email,
          redirectTo: "/auth/set-new-password",
        },
      }),
    ),
  );

//Set the new password
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

// Update password
export const changePassword = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters"),
      revokeOtherSessions: z.boolean().optional().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    return await withAuthHandler(async () => {
      const { currentPassword, newPassword, revokeOtherSessions } = data;
      return await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions,
        },
        headers: request.headers,
      });
    });
  });
