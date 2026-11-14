"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { statsApi } from "@/lib/api";
import { formatDay, formatHours, formatMoney, formatMonth, toMonthString, torontoNow } from "@/lib/format";
import type { PaymentTotals, PaymentType } from "@/lib/types";
import { useLoad } from "@/lib/use-load";
import { Card, CardHeader } from "../components/ui/Card";
import { LoadingRows } from "../components/ui/EmptyState";
import { ErrorCallout } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { Segmented } from "../components/ui/Segmented";

type View = "today" | "month";

const PAYMENT_LABELS: Record<PaymentType, string> = { CASH: "Cash", E_TRANSFER: "E-transfer" };

const iconButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-[10px] border border-line text-fg hover:bg-subtle disabled:opacity-40";

/** One line in a breakdown card: label + count on the left, total on the right. */
function TotalsRow({ label, totals }: { label: string; totals: PaymentTotals }) {
  return (
    <li className="flex min-h-14 items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-[15px] text-fg">{label}</p>
        <p className="tabular-ticker text-[13px] text-muted">
          {totals.paymentCount} paid · {formatHours(totals.hoursWorked)} · {formatMoney(totals.tips)} tips
        </p>
      </div>
      <p className="tabular-ticker text-[15px] font-medium text-fg">{formatMoney(totals.withTips)}</p>
    </li>
  );
}

/** Summary strip cell: muted label over a medium value. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="tabular-ticker mt-0.5 text-[17px] font-medium text-fg">{value}</p>
    </div>
  );
}

export default function EarningsPage() {
  const [view, setView] = useState<View>("today");
  // Any day in the month being viewed; arrows step it a month at a time.
  const [month, setMonth] = useState(torontoNow);
  const monthKey = toMonthString(month);
  const isCurrentMonth = monthKey === toMonthString(torontoNow());

  const { data, error, loading } = useLoad(
    useCallback(() => (view === "today" ? statsApi.today() : statsApi.month(monthKey)), [view, monthKey]),
  );

  function stepMonth(delta: number) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  // Newest day first.
  const days = data ? Object.entries(data.byDay).sort(([a], [b]) => b.localeCompare(a)) : [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Earnings" />

      <Segmented
        label="Period"
        options={[
          { value: "today", label: "Today" },
          { value: "month", label: "Month" },
        ]}
        value={view}
        onChange={setView}
      />

      {view === "month" && (
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => stepMonth(-1)} aria-label="Previous month" className={iconButtonClass}>
            <ChevronLeft className="h-[18px] w-[18px]" />
          </button>
          <p className="text-[15px] font-medium text-fg">{formatMonth(month)}</p>
          <button
            type="button"
            onClick={() => stepMonth(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className={iconButtonClass}
          >
            <ChevronRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      )}

      {loading ? (
        <LoadingRows rows={2} />
      ) : error || !data ? (
        <ErrorCallout message={error ?? "Couldn't load earnings."} />
      ) : (
        <>
          <div>
            <p className="text-[13px] text-muted">Total with tips</p>
            <p className="tabular-ticker text-[40px] font-semibold leading-tight text-fg">
              {formatMoney(data.total.withTips)}
            </p>
            <p className="tabular-ticker text-sm text-muted">
              {formatMoney(data.total.beforeTips)} + {formatMoney(data.total.tips)} tips
            </p>
          </div>

          {/* Summary strip: one card split by 1px line gaps. */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            <Fact label="Hours worked" value={formatHours(data.total.hoursWorked)} />
            <Fact label="Payments" value={String(data.total.paymentCount)} />
          </div>

          <Card className="px-4 pt-4 sm:px-6 sm:pt-6">
            <CardHeader title="By payment type" />
            <ul className="mt-1 divide-y divide-line">
              {(Object.keys(PAYMENT_LABELS) as PaymentType[]).map((type) => (
                <TotalsRow key={type} label={PAYMENT_LABELS[type]} totals={data.byPaymentType[type]} />
              ))}
            </ul>
          </Card>

          {view === "month" && days.length > 0 && (
            <Card className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardHeader title="By day" />
              <ul className="mt-1 divide-y divide-line">
                {days.map(([day, totals]) => (
                  <TotalsRow key={day} label={formatDay(day)} totals={totals} />
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
