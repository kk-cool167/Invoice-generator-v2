import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 border border-purple-500/30 backdrop-blur-sm",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 border border-red-400/30 backdrop-blur-sm",
        outline:
          "border border-purple-200/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-purple-500/20 text-gray-900 hover:bg-gradient-to-r hover:from-white hover:to-purple-50/50 hover:scale-105 active:scale-95 hover:border-purple-300/60 transition-all duration-200",
        secondary:
          "bg-gradient-to-r from-purple-100/90 to-purple-50/80 backdrop-blur-sm text-gray-900 shadow-sm hover:shadow-lg hover:shadow-purple-500/20 border border-purple-200/60 hover:bg-gradient-to-r hover:from-purple-200/90 hover:to-purple-100/80 hover:scale-105 active:scale-95 transition-all duration-200",
        ghost: "hover:bg-white/50 hover:text-gray-900 backdrop-blur-sm rounded-xl hover:shadow-sm hover:scale-105 active:scale-95",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700 transition-colors",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
