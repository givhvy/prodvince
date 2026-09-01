import * as React from "react";
import { cn } from "@/lib";

export function InputGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex h-9 w-full items-center overflow-hidden rounded-lg border border-input bg-background",
        className,
      )}
      {...props}
    />
  );
}

export function InputGroupAddon({
  className,
  align,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { align?: "inline-start" | "inline-end" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center px-2 text-muted-foreground",
        align === "inline-end" && "ml-auto",
        className,
      )}
      {...props}
    />
  );
}

export const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function InputGroupInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});
