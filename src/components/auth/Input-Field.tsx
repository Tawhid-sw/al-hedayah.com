import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface InputProps {
  form: any;
  name: string;
  type: string;
  lable: string;
  disabled?: boolean;
  children?: React.ReactNode;
  placeholder: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField = ({
  form,
  name,
  type,
  lable,
  disabled = false,
  children,
  placeholder,
  onChange,
}: InputProps) => {
  return (
    <form.Field
      name={name}
      children={(field: any) => {
        const isInvalid =
          field.state.meta.isTouched && field.state.meta.errors.length > 0;

        return (
          <Field data-invalid={isInvalid}>
            <div className="flex items-center">
              <FieldLabel htmlFor={field.name}>{lable}</FieldLabel>
              {children}
            </div>
            <Input
              id={field.name}
              name={field.name}
              type={type}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
                if (onChange) onChange(e);
              }}
              placeholder={placeholder}
              aria-invalid={isInvalid}
              disabled={disabled}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    />
  );
};
