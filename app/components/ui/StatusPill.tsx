import type { AppointmentStatus } from "@/lib/types";

/** Status as a small colored dot plus a text label — color is never the only signal. */
export function StatusPill({ status }: { status: AppointmentStatus }) {
  const confirmed = status === "CONFIRMED";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-fg">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${confirmed ? "bg-success" : "bg-faint"}`} />
      {confirmed ? "Confirmed" : "Cancelled"}
    </span>
  );
}
