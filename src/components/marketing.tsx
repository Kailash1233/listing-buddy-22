import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconBadge({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full bg-primary/12 text-primary",
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

export function ArrowButton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-10 place-items-center rounded-full border border-current/25 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
        className,
      )}
      aria-hidden
    >
      <ArrowUpRight className="size-4" />
    </span>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}
