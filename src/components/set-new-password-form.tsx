import { performPasswordReset } from "@/lib/auth-server";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils.ts";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "@tanstack/react-router";
import z from "zod";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function SetNewPasswordForm({
  token,
  className,
  ...props
}: { token: string } & React.ComponentProps<"div">) {
  const router = useRouter();

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onSubmit: resetSchema },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Invalid or expired reset token.");
        return;
      }

      try {
        const result = await performPasswordReset({
          data: { password: value.password, token },
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Password updated successfully!");
          router.navigate({ to: "/auth/signin" });
        }
      } catch (error: any) {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <CardDescription>Enter your new secure password</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              {/* Password Field */}
              <form.Field
                name="password"
                children={(field) => (
                  <Field>
                    <FieldLabel>New Password</FieldLabel>
                    <Input
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Confirm Password Field */}
              <form.Field
                name="confirmPassword"
                children={(field) => (
                  <Field>
                    <FieldLabel>Confirm Password</FieldLabel>
                    <Input
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.state.isSubmitting}
              >
                {form.state.isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
