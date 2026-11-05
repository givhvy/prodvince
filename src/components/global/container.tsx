import type { ReactNode } from "react";
import { cn } from "@/lib";

interface Props {
  className?: string;
  children: ReactNode;
  delay?: number;
  reverse?: boolean;
  simple?: boolean;
}

const Container = ({ children, className }: Props) => {
  return <div className={cn("h-full w-full", className)}>{children}</div>;
};

export default Container;
