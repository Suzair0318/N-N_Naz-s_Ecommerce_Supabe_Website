import Link from "next/link";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  linkHref?: string;
  linkLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  linkHref,
  linkLabel,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
          {title}
        </h2>
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="text-xs uppercase tracking-widest link-gold underline underline-offset-4"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
