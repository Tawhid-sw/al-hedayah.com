import { createFileRoute } from "@tanstack/react-router";

// import { signOut } from "@/lib/auth/auth-server";
// import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  // const signOutFn = useServerFn(signOut);

  return <div className="w-full">Home</div>;
}
