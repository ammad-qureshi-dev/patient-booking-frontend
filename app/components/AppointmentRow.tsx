import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Appointment } from "@/lib/types";
import { formatMoney, formatTime, lengthLabel } from "@/lib/format";
import { StatusPill } from "./ui/StatusPill";

/** One tappable appointment: start/end time on the left, who in the middle, price on the right. */
export function AppointmentRow({ appointment: a }: { appointment: Appointment }) {
  const cancelled = a.status === "CANCELLED";
  const details = [lengthLabel(a.length), a.notes].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/appointments/${a.id}`}
      className={`flex min-h-[72px] items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:border-line-strong active:bg-subtle ${
        cancelled ? "opacity-60" : ""
      }`}
    >
      <div className="tabular-ticker w-[80px] shrink-0">
        <p className="text-[15px] font-medium text-fg">{formatTime(a.startTime)}</p>
        <p className="text-[13px] text-muted">to {formatTime(a.endTime)}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-fg">{a.fullName}</p>
        {cancelled ? <StatusPill status={a.status} /> : <p className="truncate text-[13px] text-muted">{details}</p>}
      </div>
      <p className="tabular-ticker shrink-0 text-[15px] text-fg">{formatMoney(a.price)}</p>
      <ChevronRight className="-ml-2 h-4 w-4 shrink-0 text-faint" />
    </Link>
  );
}
