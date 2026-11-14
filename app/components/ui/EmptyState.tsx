import type { ReactNode } from "react";

/** A bordered card with a short title, one sentence, and at most one action. No icons. */
export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-line px-6 py-12 text-center">
      <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Placeholder rows while a list loads. */
export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-subtle" />
      ))}
    </div>
  );
}
