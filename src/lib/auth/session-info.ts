import { createServerFn } from "@tanstack/react-start";
import { auth } from "./auth.ts";
import { getRequest } from "@tanstack/react-start/server";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return;
    return session;
  },
);
