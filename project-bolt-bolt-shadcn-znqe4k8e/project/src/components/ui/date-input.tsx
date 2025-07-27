import { Input } from "./input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { useFormContext } from "react-hook-form";

interface DateInputProps {
  name: string;
  label: string;
  required?: boolean;
}

export function DateInput({ name, label, required = false }: DateInputProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && <span className="text-red-500">*</span>}</FormLabel>
          <FormControl>
            <Input
              type="date"
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
