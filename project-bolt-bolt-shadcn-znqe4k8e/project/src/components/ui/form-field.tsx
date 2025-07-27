import { ReactNode } from 'react';
import { Alert, AlertDescription } from "./alert";
import { FormFieldProps } from "../../types/forms";

interface FormFieldWrapperProps extends FormFieldProps {
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {!required && <span className="text-gray-500 ml-1">(Optional)</span>}
      </label>
      {children}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
