import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { signUp } from "@/lib/auth-server";
import { useState } from "react";
import * as z from "zod";

import { AuthForm } from "@/components/auth/Auth-Form";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { GoogleLoginButton } from "@/components/auth/Google-Login-Button";
import { InputField } from "@/components/auth/Input-Field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/sign-up")({
  component: RouteComponent,
});

const formSchema = z
  .object({
    name: z.string().min(2, "Name required"),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RouteComponent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(value).forEach(([k, v]) => formData.append(k, v));
        const result = await signUp({ data: formData });
        if (result?.error) {
          setIsSubmitting(false);
          toast.error(result.error);
        } else {
          setIsSubmitting(false);
          toast.success("Account created successfully!");
          router.navigate({ to: "/dashboard" });
        }
      } catch (error: any) {
        const msg =
          error?.data?.error || error?.message || "Something went wrong";
        toast.error(msg);
      }
    },
  });

  return (
    <AuthForm
      title="Create your account"
      description="Enter your details below to create your account"
      cardDiscription={true}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <Field>
            <GoogleLoginButton />
          </Field>

          {/* Name Field */}
          <InputField
            form={form}
            name="name"
            type="text"
            lable="Name"
            disabled={isSubmitting}
            placeholder="Jhon Doe"
          />
          {/* Email Field */}
          <InputField
            form={form}
            name="email"
            type="text"
            lable="Email"
            disabled={isSubmitting}
            placeholder="example@me.com"
          />

          {/* Password Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              form={form}
              name="password"
              type="password"
              lable="Password"
              disabled={isSubmitting}
              placeholder="Password"
            />
            <InputField
              form={form}
              name="confirmPassword"
              type="password"
              lable="Confirm Password"
              disabled={isSubmitting}
              placeholder="Confirm Password"
            />
          </div>

          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Create Account"}
            </Button>
            <FieldDescription className="text-center">
              Already have an account?{" "}
              <a
                onClick={() => router.navigate({ to: "/auth/sign-in" })}
                className="underline"
              >
                Sign in
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthForm>
  );
}
