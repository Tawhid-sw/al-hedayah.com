import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getTodos } from "../index";
import z from "zod";
import { selectTodoSchema } from "@/db/schema";
import { authMiddleware } from "@/lib/middleware";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/server/result/")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
  loader: async () => await getTodos(),
});

const todoSchema = z.array(selectTodoSchema);

function RouteComponent() {
  const navigate = useNavigate();
  const SignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/" });
        },
      },
    });
  };
  const testData = Route.useLoaderData();
  const checkData = todoSchema.safeParse(testData);
  if (!checkData.success) {
    return <div>❌ Invalid data from server</div>;
  }
  return (
    <>
      <pre>{JSON.stringify(checkData, null, 2)}</pre>
      <div>
        <Button onClick={SignOut}>signOut</Button>
      </div>
    </>
  );
}
