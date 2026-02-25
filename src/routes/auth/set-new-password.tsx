import { createFileRoute } from "@tanstack/react-router";
import { SetNewPasswordForm } from "@/components/set-new-password-form";
import z from "zod";

export const Route = createFileRoute("/auth/set-new-password")({
  validateSearch: z.object({
    token: z.string().catch(""),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SetNewPasswordForm token={token} />
      </div>
    </div>
  );
}
