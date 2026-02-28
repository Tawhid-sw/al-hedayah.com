import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { createOrganizationByOwner } from "@/lib/auth-server";
import * as z from "zod";
import { useState } from "react";

import { AuthForm } from "@/components/auth/Auth-Form";
import { InputField } from "@/components/auth/Input-Field";
import { Field, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { protectRoute } from "@/lib/middleware";

export const Route = createFileRoute("/owner/create-organization")({
  beforeLoad: () => protectRoute({ data: "owner" }),
  component: RouteComponent,
});

// Zod Schema for Organization
const createOrgSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  slug: z
    .string()
    .min(2, "Slug required")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  logo: z.url().or(z.literal("")),
});

function RouteComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      logo: "" as string,
    },
    validators: {
      onSubmit: createOrgSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        const result = await createOrganizationByOwner({
          data: {
            name: value.name,
            slug: value.slug,
            logo: value.logo || undefined,
          },
        });
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("New Organization successfully created");
          form.reset();
        }
      } catch (error: any) {
        toast.error("An unexpected error occurred.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    form.setFieldValue("slug", generatedSlug);
  };

  return (
    <AuthForm
      title="Create Organization"
      description="Set up your organization to start managing admins and members"
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
          {/* Organization Name */}
          <InputField
            form={form}
            name="name"
            type="text"
            lable="Organization Name"
            disabled={isSubmitting}
            placeholder="e.g. Al-Hedayah Academy"
          />

          {/* Organization Slug */}
          <InputField
            form={form}
            name="slug"
            type="text"
            lable="Organization Slug"
            disabled={isSubmitting}
            placeholder="e.g. al-hedayah-academy"
            onChange={(e) => handleNameChange(e.target.value)}
          />

          {/* Logo URL (Optional) */}
          <InputField
            form={form}
            name="logo"
            type="text"
            lable="Logo URL (Optional)"
            disabled={isSubmitting}
            placeholder="https://example.com/logo.png"
          />

          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Create Organization"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthForm>
  );
}
