import { useForm } from "@tanstack/react-form-start";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { authMiddleware } from "@/lib/middleware";

const validateTodoTitle = z.object({
  title: z
    .string()
    .min(3, "Todo title must be 3 char atleast")
    .max(255, "Todo title cannot be 255 char longer"),
});

export type todoTitlePrpops = z.infer<typeof validateTodoTitle>;

export const getTodos = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const { getTodosFnc } = await import("@/data/server");
    return getTodosFnc();
  });

export const postTodo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(validateTodoTitle)
  .handler(async ({ data }) => {
    const { postTodoFnc } = await import("@/data/server");
    return postTodoFnc(data);
  });

export const Route = createFileRoute("/server/")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      title: "",
    },
    validators: {
      onSubmit: validateTodoTitle,
    },
    onSubmit: async ({ value }) => {
      const res = await postTodo({
        data: {
          title: value.title,
        },
      });
      if (res.ok) {
        await router.invalidate();
        navigate({ to: "/server/result" });
      }
      console.log("form submited", value);
    },
  });
  return (
    <div className="flex items-center justify-center w-full">
      <form
        onSubmit={(e) => {
          (e.preventDefault(), e.stopPropagation(), form.handleSubmit());
        }}
      >
        <form.Field
          name="title"
          children={(field) => (
            <div>
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="border border-red-300"
              />
              {field.state.meta.errors.length > 0 && (
                <span style={{ color: "red" }}>
                  {field.state.meta.errors[0]?.message}
                </span>
              )}
              <button type="submit">submit</button>
            </div>
          )}
        />
      </form>
    </div>
  );
}
