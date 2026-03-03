import "@tanstack/react-start/server-only";
import ImageKit from "@imagekit/nodejs";

export type AuthParams = {
  token: string;
  signature: string;
  expire: number;
};

export function getImageKitServer() {
  return new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY! });
}
