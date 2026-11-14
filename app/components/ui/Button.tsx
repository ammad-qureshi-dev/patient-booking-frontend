import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "tertiary";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-4 font-sans text-[15px] font-medium transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-surface hover:opacity-90",
  secondary: "border border-line bg-surface text-fg hover:bg-subtle",
  tertiary: "bg-transparent text-muted hover:text-fg",
};

export function buttonClass(variant: Variant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: LucideIcon };

export function Button({ variant = "primary", icon: Icon, className = "", children, ...props }: Props) {
  return (
    <button className={buttonClass(variant, className)} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/** A navigation link styled as a button — use instead of nesting a <Button> inside a <Link>. */
export function LinkButton({
  variant = "primary",
  icon: Icon,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; icon?: LucideIcon }) {
  return (
    <Link className={buttonClass(variant, className)} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}
