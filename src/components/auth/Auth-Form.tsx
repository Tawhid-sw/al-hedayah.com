import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FieldDescription } from "../ui/field";

interface FormProps {
  children: React.ReactNode;
  className?: string;
  title: string;
  description: string;
  cardDiscription: boolean;
  props?: React.ComponentProps<"div">;
}

export const AuthForm = ({
  children,
  className,
  title,
  description,
  cardDiscription,
  ...props
}: FormProps) => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent>{children}</CardContent>
          </Card>

          {cardDiscription && (
            <FieldDescription className="px-6 text-center">
              By clicking continue, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </FieldDescription>
          )}
        </div>
      </div>
    </div>
  );
};
