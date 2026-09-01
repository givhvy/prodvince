import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonStyles } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

const legacyVariantMap = {
  default: "primary",
  blue: "primary",
  destructive: "danger",
  outline: "secondary",
  secondary: "secondary",
  white: "secondary",
  subtle: "secondary",
  ghost: "ghost",
  link: "ghost",
} as const;

const legacySizeMap = {
  default: "medium",
  sm: "small",
  lg: "medium",
  xl: "medium",
  xs: "xs",
  icon: "medium",
  iconlg: "medium",
} as const;

type LegacyVariant = keyof typeof legacyVariantMap;
type LegacySize = keyof typeof legacySizeMap;
type BoardVariant = "primary" | "secondary" | "ghost" | "danger";
type BoardSize = "medium" | "small" | "xs";
type ButtonVariantProp = LegacyVariant | BoardVariant;
type ButtonSizeProp = LegacySize | BoardSize;

function resolveBoardVariant(variant?: ButtonVariantProp | null): BoardVariant {
  if (!variant) return "primary";
  if (variant in legacyVariantMap) {
    return legacyVariantMap[variant as LegacyVariant];
  }
  return variant as BoardVariant;
}

function resolveBoardSize(size?: ButtonSizeProp | null): BoardSize {
  if (!size) return "medium";
  if (size in legacySizeMap) {
    return legacySizeMap[size as LegacySize];
  }
  return size as BoardSize;
}

export function boardButtonClassName({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariantProp | null;
  size?: ButtonSizeProp | null;
  className?: string;
} = {}) {
  const boardVariant = resolveBoardVariant(variant);
  const boardSize = resolveBoardSize(size);
  const iconOnly = size === "icon" || size === "iconlg";

  return cx(
    buttonStyles.base,
    buttonStyles.size[boardSize],
    buttonStyles.variant[boardVariant],
    iconOnly && buttonStyles.iconOnlySize[boardSize],
    size === "lg" && "h-10 rounded-2lg px-3",
    size === "xl" && "h-12 rounded-2lg px-4",
    variant === "link" && "h-auto p-0 underline-offset-4 hover:underline",
    className,
  );
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariantProp | null;
  size?: ButtonSizeProp | null;
  className?: string;
} = {}) {
  return boardButtonClassName({ variant, size, className });
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariantProp | null;
  size?: ButtonSizeProp | null;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={boardButtonClassName({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
