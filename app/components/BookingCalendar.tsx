"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { appointmentApi } from "@/lib/api";
import { formatDay, formatMonth, toDateString } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { useLoad } from "@/lib/use-load";
import { AppointmentRow } from "./AppointmentRow";
import { EmptyState, LoadingRows } from "./ui/EmptyState";
import { ErrorCallout } from "./ui/Input";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Heat-map levels by number of confirmed bookings. Full class names so Tailwind picks them up. */
const HEAT = [
  { label: "Free", min: 0, cell: "bg-heat-free/25", swatch: "bg-heat-free" },
  { label: "1–2", min: 1, cell: "bg-heat-low/35", swatch: "bg-heat-low" },
  { label: "3–4", min: 3, cell: "bg-heat-mid/35", swatch: "bg-heat-mid" },
  { label: "5+", min: 5, cell: "bg-heat-high/35", swatch: "bg-heat-high" },
];

const heatFor = (count: number) => HEAT.findLast((h) => count >= h.min)!;

const iconButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-[10px] border border-line text-fg hover:bg-subtle";

/** Every day of the month, with blank slots in front so the 1st lands on its weekday. */
function monthGrid(month: Date): (string | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const leadingBlanks = new Date(year, m, 1).getDay();
  return [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateString(new Date(year, m, i + 1))),
  ];
}

/** Confirmed bookings per "yyyy-MM-dd". */
function countByDay(appointments: Appointment[]) {
  const counts = new Map<string, number>();
  for (const a of appointments) {
    if (a.status !== "CONFIRMED") continue;
    const day = a.startTime.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return counts;
}

/** Month heat map of how booked each day is; tap a day to see its bookings in order. */
export function BookingCalendar() {
  const today = toDateString(new Date());
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState(today);

  const days = monthGrid(month);
  const firstDay = toDateString(month);
  const lastDay = toDateString(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const { data, error, loading, reload } = useLoad(
    useCallback(() => appointmentApi.between(firstDay, lastDay), [firstDay, lastDay]),
  );
  const counts = countByDay(data ?? []);

  function stepMonth(delta: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(next);
    // Land on today when coming back to the current month, otherwise on the 1st.
    setSelected(today.startsWith(toDateString(next).slice(0, 7)) ? today : toDateString(next));
  }

  // The backend returns them sorted by start time.
  const dayBookings = (data ?? []).filter((a) => a.startTime.startsWith(selected));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => stepMonth(-1)} aria-label="Previous month" className={iconButtonClass}>
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <p className="text-[15px] font-medium text-fg">{formatMonth(month)}</p>
        <button type="button" onClick={() => stepMonth(1)} aria-label="Next month" className={iconButtonClass}>
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1.5 pb-1.5 text-center text-xs text-muted" aria-hidden>
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day, i) => {
            if (!day) return <span key={`blank-${i}`} />;
            const count = counts.get(day) ?? 0;
            const past = day < today;
            // Past days with nothing booked aren't "free", so they get no color.
            const tint = loading || (past && count === 0) ? "bg-subtle" : heatFor(count).cell;
            const isSelected = day === selected;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelected(day)}
                aria-pressed={isSelected}
                aria-label={`${formatDay(day)}, ${count === 0 ? "no bookings" : `${count} booked`}`}
                className={`tabular-ticker flex aspect-square min-h-11 items-center justify-center rounded-[10px] text-[15px] transition-shadow ${tint} ${
                  past ? "text-muted" : "text-fg"
                } ${day === today ? "font-semibold underline underline-offset-4" : ""} ${
                  isSelected ? "ring-2 ring-fg" : ""
                }`}
              >
                {Number(day.slice(8))}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          {HEAT.map((h) => (
            <span key={h.label} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-[3px] ${h.swatch}`} />
              {h.label}
            </span>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-[17px] font-semibold text-fg">
          {formatDay(selected)}
          {!loading && !error && (
            <span className="ml-2 text-sm font-normal text-muted">
              {dayBookings.length} {dayBookings.length === 1 ? "booking" : "bookings"}
            </span>
          )}
        </h2>
        {loading ? (
          <LoadingRows rows={2} />
        ) : error ? (
          <div className="flex flex-col gap-3">
            <ErrorCallout message={error} />
            <button type="button" onClick={reload} className="min-h-11 text-sm font-medium text-accent">
              Try again
            </button>
          </div>
        ) : dayBookings.length === 0 ? (
          <EmptyState title="No bookings" body={selected < today ? "Nothing was booked this day." : "This day is free."} />
        ) : (
          dayBookings.map((a) => <AppointmentRow key={a.id} appointment={a} />)
        )}
      </section>
    </div>
  );
}
