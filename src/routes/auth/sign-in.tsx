import { createFileRoute } from "@tanstack/react-router";
import { signIn } from "@/lib/auth-server";
import { GoogleLoginButton } from "@/components/auth/Google-Login-Button";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import * as z from "zod";
import { AuthForm } from "@/components/auth/Auth-Form";
import { useState } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { InputField } from "@/components/auth/Input-Field";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const Route = createFileRoute("/auth/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(value).forEach(([k, v]) => formData.append(k, v));
        const result = await signIn({ data: formData });
        if (result?.error) {
          setIsSubmitting(false);
          toast.error(result.error);
        } else {
          setIsSubmitting(false);
          toast.success("Sign in successful!");
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
      title="Welcome Back"
      description="Sign in to your account"
      cardDiscription={true}
    >
      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          {/* Social Buttons */}
          <Field>
            <GoogleLoginButton />
          </Field>

          <FieldSeparator>Or continue with</FieldSeparator>

          {/* Email Field */}
          <InputField
            form={form}
            name="email"
            type="text"
            lable="Email"
            disabled={isSubmitting}
            placeholder="example@me.com"
          />

          {/* Password Field */}
          <InputField
            form={form}
            name="password"
            type="password"
            lable="Password"
            disabled={isSubmitting}
            placeholder="Password"
          >
            <a
              onClick={() => router.navigate({ to: "/auth/forgot-password" })}
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </InputField>

          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Sign in"}
            </Button>

            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <a onClick={() => router.navigate({ to: "/auth/sign-up" })}>
                Sign up
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </AuthForm>
  );
}
