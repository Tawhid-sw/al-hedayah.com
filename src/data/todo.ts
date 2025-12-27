import { createServerFn } from "@tanstack/react-start";

interface todoProps {
  id: number;
  title: string;
  completed: boolean;
}

const mockTodo: todoProps[] = [
  {
    id: 1,
    title: "Todo 1",
    completed: false,
  },
];
export const getAllTodos = createServerFn({ method: "GET" }).handler(
  async () => {
    return [...mockTodo];
  }
);
