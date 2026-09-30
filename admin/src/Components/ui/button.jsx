import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none motion-safe:hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-green-800 bg-green-900 text-white hover:bg-green-800",
        outline: "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        secondary: "border-gray-200 bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "border-transparent bg-transparent text-gray-700 hover:bg-gray-100",
        destructive: "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
        link: "border-transparent bg-transparent px-0 text-green-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-11 gap-2 px-5",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
