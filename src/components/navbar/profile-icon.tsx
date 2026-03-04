import { UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: "",
});

export const ProfileIcon = () => {
  const { data: session } = authClient.useSession();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full border border-border/40 "
    >
      <Avatar className="flex items-center justify-center text-xl">
        {session?.user ? (
          <div>{session.user.name.slice(0, 1).toUpperCase()}</div>
        ) : (
          <AvatarFallback>
            <UserCircle className="w-6 h-6 text-primary" />
          </AvatarFallback>
        )}
      </Avatar>
    </Button>
  );
};
