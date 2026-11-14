import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  meta,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Small line above the title, e.g. a status. */
  meta?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3">
      {back && (
        <Link
          href={back.href}
          className="-my-2 inline-flex min-h-10 w-fit items-center gap-1.5 text-[13px] text-muted hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {back.label}
        </Link>
      )}
      <div className="min-w-0">
        {meta && <div className="mb-2 flex flex-wrap items-center gap-3">{meta}</div>}
        <h1 className="text-[28px] font-semibold leading-tight text-fg sm:text-[34px]">{title}</h1>
        {description && <div className="mt-1 text-[15px] text-muted">{description}</div>}
      </div>
    </div>
  );
}
