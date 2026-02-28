import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { createAdminByOwner } from "@/lib/auth-server";
import * as z from "zod";
import { useState } from "react";

import { AuthForm } from "@/components/auth/Auth-Form";
import { InputField } from "@/components/auth/Input-Field";
import { Field, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { protectRoute } from "@/lib/middleware.ts";

export const Route = createFileRoute("/owner/create-admin")({
  beforeLoad: () => protectRoute({ data: "owner" }),
  component: RouteComponent,
});

const registerAdminSchema = z
  .object({
    name: z.string().min(2, "Name required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: registerAdminSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        const result = await createAdminByOwner({
          data: {
            name: value.name,
            email: value.email,
            password: value.password,
          },
        });

        if (result && typeof result === "object" && "error" in result) {
          toast.error(String(result.error));
        } else {
          toast.success("New Admin successfully created");
          form.reset();
        }
      } catch (error: any) {
        toast.error(error?.message || "Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AuthForm
      title="Create New Admin"
      description="Register a new administrative user for your organization"
      cardDiscription={false}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <InputField
            form={form}
            name="name"
            type="text"
            lable="Full Name"
            disabled={isSubmitting}
            placeholder="e.g. Abdullah Hasan"
          />

          <InputField
            form={form}
            name="email"
            type="email"
            lable="Email Address"
            disabled={isSubmitting}
            placeholder="admin@al-hedayah.com"
          />

          <InputField
            form={form}
            name="password"
            type="password"
            lable="Password"
            disabled={isSubmitting}
            placeholder="Min. 8 characters"
          />

          <InputField
            form={form}
            name="confirmPassword"
            type="password"
            lable="Confirm Password"
            disabled={isSubmitting}
            placeholder="Repeat password"
          />

          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Register Admin"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthForm>
  );
}
