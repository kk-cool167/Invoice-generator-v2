import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            id={id}
            message={description || title || ''}
            onClose={() => {}}
            title={title as string}
          />
        );
      })}
      <ToastViewport>
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <div key={id} className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
              {action}
              <ToastClose />
            </div>
          );
        })}
      </ToastViewport>
    </ToastProvider>
  );
}
