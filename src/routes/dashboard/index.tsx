import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-server.ts";
import { getSession } from "@/lib/middleware";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/auth/signin" });
    }
    return { user: session.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const signOutFn = useServerFn(signOut);
  const { user } = Route.useRouteContext();
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div>Welcome, {user.name}!</div>
      <Button onClick={() => signOutFn()}>Sign out</Button>
    </div>
  );
}
