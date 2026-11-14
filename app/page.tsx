"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { appointmentApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { useLoad } from "@/lib/use-load";
import { AppointmentRow } from "./components/AppointmentRow";
import { BookingCalendar } from "./components/BookingCalendar";
import { LinkButton } from "./components/ui/Button";
import { EmptyState, LoadingRows } from "./components/ui/EmptyState";
import { ErrorCallout } from "./components/ui/Input";
import { PageHeader } from "./components/ui/PageHeader";
import { Segmented } from "./components/ui/Segmented";

type View = "today" | "calendar";

const VIEWS: { value: View; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "calendar", label: "Calendar" },
];

function summary(appointments: Appointment[]) {
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED");
  const total = confirmed.reduce((sum, a) => sum + a.price, 0);
  const noun = confirmed.length === 1 ? "appointment" : "appointments";
  return `${confirmed.length} ${noun} today · ${formatMoney(total)} booked`;
}

function TodayList() {
  const { data, error, loading, reload } = useLoad(appointmentApi.today);

  if (loading) return <LoadingRows />;
  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <ErrorCallout message={error} />
        <button type="button" onClick={reload} className="min-h-11 text-sm font-medium text-accent">
          Try again
        </button>
      </div>
    );
  }
  if (!data?.length) {
    return (
      <EmptyState
        title="Nothing booked"
        body="No appointments today."
        action={
          <LinkButton href="/appointments/new" variant="secondary" icon={Plus}>
            Book appointment
          </LinkButton>
        }
      />
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">{summary(data)}</p>
      {data.map((a) => (
        <AppointmentRow key={a.id} appointment={a} />
      ))}
    </div>
  );
}

export default function SchedulePage() {
  const [view, setView] = useState<View>("today");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Schedule" />
      <Segmented label="Schedule view" options={VIEWS} value={view} onChange={setView} />
      {view === "today" ? <TodayList /> : <BookingCalendar />}
    </div>
  );
}
