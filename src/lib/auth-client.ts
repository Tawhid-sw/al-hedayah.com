import { createAuthClient } from "better-auth/react";
import { serverEnv } from "./server-env";

export const authClient = createAuthClient({
  baseURL: serverEnv.BETTER_AUTH_URL!,
});
export const { signIn, signUp, signOut } = authClient;
