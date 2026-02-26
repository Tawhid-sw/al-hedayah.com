import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { requestPasswordReset } from "@/lib/auth-server";
import * as z from "zod";
import { useState } from "react";

import { AuthForm } from "@/components/auth/Auth-Form";
import { InputField } from "@/components/auth/Input-Field";
import { Field, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/auth/forgot-password")({
  component: RouteComponent,
});

const forgotSchema = z.object({
  email: z.email(),
});

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: forgotSchema },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        const result = await requestPasswordReset({ data: value });
        if (result?.error) {
          setIsSubmitting(false);
          toast.error(result.error);
        } else {
          setIsSubmitting(false);
          toast.success("If an account exists, a reset link has been sent!");
        }
      } catch (error: any) {
        toast.error("Failed to send reset email");
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
          {/* Email Field */}
          <InputField
            form={form}
            name="email"
            type="text"
            lable="Email"
            disabled={isSubmitting}
            placeholder="example@me.com"
          />

          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Send Reset Link"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthForm>
  );
}
