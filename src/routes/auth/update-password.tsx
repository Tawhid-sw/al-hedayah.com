import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { changePassword } from "@/lib/auth-server";
import { useState } from "react";
import * as z from "zod";

import { AuthForm } from "@/components/auth/Auth-Form";
import { InputField } from "@/components/auth/Input-Field";
import { Field, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/update-password")({
  component: RouteComponent,
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
  });

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        const result = await changePassword({
          data: {
            currentPassword: value.currentPassword,
            newPassword: value.newPassword,
          },
        });

        if (result?.error) {
          setIsSubmitting(false);
          toast.error(result.error);
        } else {
          setIsSubmitting(false);
          toast.success("Password updated successfully!");
          form.reset();
        }
      } catch (error: any) {
        toast.error(
          "Failed to update password. Please check your current password.",
        );
      }
    },
  });
  return (
    <AuthForm
      title="Change Password"
      description="Update your account password"
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
          {/* Current Password */}
          <InputField
            form={form}
            name="currentPassword"
            type="password"
            lable="Current Password"
            disabled={isSubmitting}
            placeholder="Current Password"
          />
          {/* New Password */}
          <InputField
            form={form}
            name="newPassword"
            type="password"
            lable="New Password"
            disabled={isSubmitting}
            placeholder="New Password"
          />
          {/* Confirm New Password */}
          <InputField
            form={form}
            name="confirmPassword"
            type="password"
            lable="Confirm New Password"
            disabled={isSubmitting}
            placeholder="Confirm New Password"
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
