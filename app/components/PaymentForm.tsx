"use client";

import { useState, type FormEvent } from "react";
import { ApiError, appointmentApi } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Appointment, PaymentType } from "@/lib/types";
import { Button } from "./ui/Button";
import { Card, CardHeader } from "./ui/Card";
import { ErrorCallout, Field, MoneyInput } from "./ui/Input";
import { Segmented } from "./ui/Segmented";

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "E_TRANSFER", label: "E-transfer" },
];

const isMoney = (value: string) => value.trim() !== "" && !Number.isNaN(Number(value)) && Number(value) >= 0;

/** Records what the client paid once the appointment is done. Saving again replaces the last entry. */
export function PaymentForm({ appointment }: { appointment: Appointment }) {
  const showToast = useToast();
  const [amount, setAmount] = useState(String(appointment.price));
  const [tip, setTip] = useState("");
  const [type, setType] = useState<PaymentType>("CASH");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!isMoney(amount)) found.amountReceived = "Enter the amount received.";
    if (tip.trim() && !isMoney(tip)) found.tipAmount = "Enter a valid tip, or leave it empty.";
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await appointmentApi.recordPayment(appointment.id, {
        amountReceived: Number(amount),
        tipAmount: tip.trim() ? Number(tip) : undefined,
        type,
      });
      showToast("Payment recorded");
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError("Something went wrong. Please try again.");
      setErrors(apiError.fieldErrors);
      setFormError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4 sm:p-6">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <CardHeader title="Payment" />
        <Field label="Paid by">
          <Segmented label="Paid by" options={PAYMENT_TYPES} value={type} onChange={setType} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <MoneyInput
            id="amountReceived"
            label="Amount received"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amountReceived}
          />
          <MoneyInput
            id="tipAmount"
            label="Tip (optional)"
            placeholder="0.00"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            error={errors.tipAmount}
          />
        </div>
        {formError && <ErrorCallout message={formError} />}
        <Button type="submit" disabled={saving} className="w-full sm:w-auto sm:self-end">
          {saving ? "Saving…" : "Record payment"}
        </Button>
      </form>
    </Card>
  );
}
