import { createServerFn } from "@tanstack/react-start";
import {
  getImageKitServer,
  type AuthParams,
} from "@/lib/imagekit/imagekit.server";

export const getImageKitAuth = createServerFn({
  method: "GET",
}).handler(async (): Promise<AuthParams> => {
  const ik = getImageKitServer();
  return ik.helper.getAuthenticationParameters();
});
