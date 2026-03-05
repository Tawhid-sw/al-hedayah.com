import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/hero/index";

// import { signOut } from "@/lib/auth/auth-server";
// import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  // const signOutFn = useServerFn(signOut);

  return (
    <div className="w-full">
      <HeroSection></HeroSection>
    </div>
  );
}
