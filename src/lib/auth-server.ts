import { createServerFn } from "@tanstack/react-start";
import { auth } from "./auth";
import { withAuthHandler } from "./auth-handler";
import { isRedirect, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";

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
