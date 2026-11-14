"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { appointmentApi } from "@/lib/api";
import { formatDay, formatMoney, formatTime, formatTimeRange, lengthLabel } from "@/lib/format";
import { useLoad } from "@/lib/use-load";
import { PaymentForm } from "../../components/PaymentForm";
import { LinkButton } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState, LoadingRows } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusPill } from "../../components/ui/StatusPill";

const BACK = { href: "/", label: "Schedule" };

/** Summary strip cell: muted label over a medium value. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="tabular-ticker mt-0.5 text-[15px] font-medium text-fg">{value}</p>
    </div>
  );
}

export default function AppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const { data: appointment, error, loading } = useLoad(useCallback(() => appointmentApi.getById(id), [id]));

  if (loading) return <LoadingRows rows={2} />;
  if (error || !appointment) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Appointment" back={BACK} />
        <EmptyState title="Couldn't load this appointment" body={error ?? "Please try again."} />
      </div>
    );
  }

  const a = appointment;
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        back={BACK}
        meta={<StatusPill status={a.status} />}
        title={a.fullName}
        description={`${formatDay(a.startTime)} · ${formatTimeRange(a.startTime, a.endTime)}`}
      />

      {/* Summary strip: one card split by 1px line gaps. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        <Fact label="Start" value={formatTime(a.startTime)} />
        <Fact label="End" value={formatTime(a.endTime)} />
        <Fact label="Length" value={lengthLabel(a.length)} />
        <Fact label="Price" value={formatMoney(a.price)} />
      </div>

      {a.notes && (
        <Card className="p-4 sm:p-6">
          <p className="text-[13px] text-muted">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-[15px] text-fg">{a.notes}</p>
        </Card>
      )}

      <LinkButton href={`/appointments/${a.id}/edit`} variant="secondary" icon={Pencil}>
        Edit appointment
      </LinkButton>

      {a.status === "CONFIRMED" && <PaymentForm appointment={a} />}
    </div>
  );
}
