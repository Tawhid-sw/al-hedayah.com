// import { getAllTodos } from "@/data/todo.ts";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const todoSchema = z.object({
  id: z.number().nonnegative(),
  title: z.string().min(5).max(15),
  completed: z.boolean(),
});

type todoProps = z.infer<typeof todoSchema>;

const mockTodo: todoProps[] = [
  {
    id: 1,
    title: "Todo 1",
    completed: false,
  },
];

const fakeData: todoProps = {
  id: 3,
  title: "Todo 2",
  completed: true,
};
const getAllTodos = createServerFn({ method: "GET" }).handler(async () => {
  return [...mockTodo];
});

const postTodo = createServerFn({ method: "POST" })
  .inputValidator(todoSchema)
  .handler(async ({ data }) => {
    const checkData = mockTodo.some((e) => e.id === data.id);
    if (checkData) return { message: "The id is already exiest" };
    mockTodo.push(data);
    return [...mockTodo];
  });

export const Route = createFileRoute("/todoServer/")({
  component: RouteComponent,
  loader: async () => await getAllTodos(),
});

function RouteComponent() {
  // const data = Route.useLoaderData();
  const handlePost = async () => {
    const data = await postTodo({ data: fakeData });
    console.log(data);
  };
  return (
    <div>
      <h1>Put fake data</h1>
      <button onClick={handlePost}>Post fake data</button>
    </div>
  );
}
