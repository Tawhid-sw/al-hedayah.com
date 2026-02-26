import { createFileRoute, useRouter } from "@tanstack/react-router";
import { performPasswordReset } from "@/lib/auth-server";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import * as z from "zod";

import { AuthForm } from "@/components/auth/Auth-Form";
import { Field, FieldGroup } from "@/components/ui/field";
import { InputField } from "@/components/auth/Input-Field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/set-new-password")({
  validateSearch: z.object({
    token: z.string().catch(""),
  }),
  component: RouteComponent,
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RouteComponent() {
  const { token } = Route.useSearch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: { onSubmit: resetSchema },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Invalid or expired reset token.");
        return;
      }
      try {
        setIsSubmitting(true);
        const result = await performPasswordReset({
          data: { password: value.password, token },
        });

        if (result?.error) {
          setIsSubmitting(false);
          toast.error(result.error);
        } else {
          setIsSubmitting(false);
          toast.success("Password updated successfully!");
          router.navigate({ to: "/auth/sign-in" });
        }
      } catch (error: any) {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });
  return (
    <AuthForm
      title="Forgot Password"
      description="Enter your email to receive a reset link"
      cardDiscription={false}
    >
      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* New Password */}
          <InputField
            form={form}
            name="password"
            type="password"
            lable="New Password"
            disabled={isSubmitting}
            placeholder="password"
          />
          {/* Confirm Password */}
          <InputField
            form={form}
            name="confirmPassword"
            type="password"
            lable="Confirm Password"
            disabled={isSubmitting}
            placeholder="Confirm Password"
          />

          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Change Password"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthForm>
  );
}
