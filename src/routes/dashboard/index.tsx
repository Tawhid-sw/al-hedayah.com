import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-server";
import { protectRoute } from "@/lib/middleware";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => protectRoute({ data: "dashboard" }),
  component: RouteComponent,
});

function RouteComponent() {
  const signOutFn = useServerFn(signOut);
  const { user } = Route.useRouteContext();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
        </div>
        <Button variant="destructive" onClick={() => signOutFn()}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <h3 className="font-medium">Account Role</h3>
          <p className="text-2xl font-bold capitalize">
            {user?.role === "owner" ? "System Owner" : "Admin"}
          </p>
        </div>
      </div>
    </div>
  );
}
