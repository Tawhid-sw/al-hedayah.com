// lib/auth-handler.ts
import { isRedirect } from "@tanstack/react-router";
import { APIError } from "better-auth/api";
import { setResponseStatus } from "@tanstack/react-start/server";

export async function withAuthHandler(logic: () => Promise<any>) {
  try {
    return await logic();
  } catch (error: any) {
    if (isRedirect(error)) throw error;

    if (error instanceof APIError || error.name === "BetterAuthError") {
      setResponseStatus(401);
      return {
        error: error.message || "Authentication failed",
      };
    }

    console.error("Server Error:", error);
    setResponseStatus(500);
    return {
      error: "Internal Server Error",
    };
  }
}
