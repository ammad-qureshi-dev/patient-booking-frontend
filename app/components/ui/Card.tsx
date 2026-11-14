import type { ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</section>;
}

export function CardHeader({ title, actions }: { title: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[17px] font-semibold text-fg">{title}</h2>
      {actions}
    </div>
  );
}
