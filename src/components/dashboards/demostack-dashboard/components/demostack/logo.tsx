import Link from "next/link";
import Icons from "@/components/global/icons";
import type { SVGProps } from "react";

export function DemostackLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <Link href="/" className="flex items-center gap-2 text-foreground">
      <Icons.icon className="size-5" />
      <span className="text-sm font-bold tracking-tight">Velta Studio</span>
    </Link>
  );
}
