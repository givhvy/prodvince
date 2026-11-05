"use client";

import { cn } from "@/lib";
import { motion } from "framer-motion";

interface Props {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  reverse?: boolean;
}

export default function MotionContainer({
  children,
  className,
  delay = 0.2,
  reverse,
}: Props) {
  return (
    <motion.div
      className={cn("h-full w-full", className)}
      initial={{ opacity: 0, y: reverse ? -20 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, type: "spring" }}
    >
      {children}
    </motion.div>
  );
}
