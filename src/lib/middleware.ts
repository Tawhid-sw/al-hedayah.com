import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { redirect } from "@tanstack/react-router";

/**
 * SERVER API PROTECTION MIDDLEWARES
 * These prevent unauthorized direct API/Server Function calls.
 */

// A. OWNER ONLY: Only global owners can execute
export const ownerOnlyMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || session.user.role !== "owner") {
      throw new Error("Forbidden: Owner privileges required.");
    }
    return next({ context: { session, user: session.user } });
  },
);

// B. ADMIN  ONLY: Only organization admins (or owners) can execute
export const adminOnlyMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const isAdmin = !!session?.session.activeOrganizationId;
    const isOwner = session?.user.role === "owner";

    if (!session || (!isAdmin && !isOwner)) {
      throw new Error("Forbidden: Admin privileges required.");
    }
    return next({ context: { session, user: session.user } });
  },
);

// C. AUTH ONLY: Any logged-in user can execute
export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      throw new Error("Unauthorized: Please sign in.");
    }
    return next({ context: { session, user: session.user } });
  },
);

export const protectRoute = createServerFn({ method: "GET" })
  .inputValidator((d: "owner" | "dashboard" | "user") => d)
  .handler(async ({ data: target }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
      throw redirect({ to: "/auth/sign-in" });
    }

    const isOwner = session.user.role === "owner";

    let isAdmin = !!session.session.activeOrganizationId;
    if (!isAdmin && !isOwner) {
      const userOrgs = await auth.api.listOrganizations({ headers });
      isAdmin = userOrgs && userOrgs.length > 0;
    }

    if (target === "owner" && !isOwner) {
      if (isAdmin) {
        throw redirect({ to: "/dashboard" });
      }
      throw redirect({ to: "/" });
    }
    if (target === "dashboard" && !isOwner && !isAdmin) {
      throw redirect({ to: "/" });
    }
    return {
      user: session.user,
      session: session.session,
      isOwner,
      isAdmin,
    };
  });
