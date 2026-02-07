import { todoTable } from "@/db/schema";
import { db } from "@/db";

import { todoTitlePrpops } from "@/routes/server";

export const getTodosFnc = async () => {
  try {
    const allTodos = await db.select().from(todoTable);
    return allTodos;
  } catch (error) {
    return { message: "Something went wrong", status: 500, ok: false };
  }
};

export const postTodoFnc = async (data: todoTitlePrpops) => {
  try {
    await db.insert(todoTable).values({ title: data.title });
    return { message: "New todo added", status: 200, ok: true };
  } catch (error) {
    return { message: "Something went wrong", status: 500, ok: false };
  }
};
