"use client";

import { useCallback, useState, type FormEvent } from "react";
import { ApiError, appointmentApi } from "@/lib/api";
import {
  LENGTHS,
  formatTime,
  lengthMinutes,
  minutesToTime,
  parseLocal,
  timeToMinutes,
  toDateString,
} from "@/lib/format";
import type { Appointment, AppointmentLength, AppointmentRequest } from "@/lib/types";
import { useLoad } from "@/lib/use-load";
import { Button } from "./ui/Button";
import { Card, CardHeader } from "./ui/Card";
import { ErrorCallout, Field, Input, MoneyInput, Select, Textarea } from "./ui/Input";
import { Segmented } from "./ui/Segmented";

// Bookable start times: every 30 minutes from 7:00 to 21:30 (the backend requires 30-minute alignment).
const FIRST_SLOT = 7 * 60;
const LAST_SLOT = 21 * 60 + 30;
const SLOTS = Array.from({ length: (LAST_SLOT - FIRST_SLOT) / 30 + 1 }, (_, i) => FIRST_SLOT + i * 30);

/** Minutes since midnight for a "yyyy-MM-ddTHH:mm:ss" value. */
const minutesOf = (dateTime: string) => timeToMinutes(dateTime.slice(11, 16));

/** Why a start time can't be picked, or null if it's free. */
function slotProblem(
  start: number,
  length: AppointmentLength,
  date: string,
  booked: Appointment[],
  editingId?: string,
): string | null {
  const end = start + lengthMinutes(length);
  const now = new Date();
  if (date === toDateString(now) && start <= now.getHours() * 60 + now.getMinutes()) return "past";
  const clash = booked.some(
    (a) =>
      a.id !== editingId &&
      a.status === "CONFIRMED" &&
      minutesOf(a.startTime) < end &&
      minutesOf(a.endTime) > start,
  );
  return clash ? "booked" : null;
}

type Props = {
  /** Pre-fills the form when editing. */
  initial?: Appointment;
  submitLabel: string;
  onSubmit: (request: AppointmentRequest) => Promise<void>;
};

export function AppointmentForm({ initial, submitLabel, onSubmit }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [date, setDate] = useState(initial ? initial.startTime.slice(0, 10) : toDateString(new Date()));
  const [time, setTime] = useState(initial ? initial.startTime.slice(11, 16) : "");
  const [length, setLength] = useState<AppointmentLength>(initial?.length ?? "ONE_HOUR");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // That day's bookings, so taken times are greyed out in the picker.
  const day = useLoad(useCallback(() => appointmentApi.between(date, date), [date]));
  const booked = day.data ?? [];

  function validate(): Record<string, string> {
    const found: Record<string, string> = {};
    if (!fullName.trim()) found.fullName = "Enter the client's name.";
    if (!date) found.date = "Pick a date.";
    if (!time) found.startTime = "Pick a start time.";
    const amount = Number(price);
    if (price.trim() === "" || Number.isNaN(amount) || amount < 0) found.price = "Enter a price, e.g. 80.";
    return found;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit({
        fullName: fullName.trim(),
        notes: notes.trim() || undefined,
        price: Number(price),
        startTime: `${date}T${time}:00`,
        length,
      });
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError("Something went wrong. Please try again.");
      setErrors(apiError.fieldErrors);
      setFormError(apiError.message);
      setSaving(false);
    }
  }

  const today = toDateString(new Date());

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        <CardHeader title="Client" />
        <Input
          id="fullName"
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="off"
          autoCapitalize="words"
          maxLength={255}
          error={errors.fullName}
        />
        <Textarea
          id="notes"
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          error={errors.notes}
        />
      </Card>

      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        <CardHeader title="When" />
        <Input
          id="date"
          type="date"
          big
          label="Date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
        <Field label="Length">
          <Segmented
            label="Length"
            options={LENGTHS.map((l) => ({ value: l.value, label: l.label }))}
            value={length}
            onChange={setLength}
          />
        </Field>
        <Select
          id="time"
          big
          label="Start time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          error={errors.startTime}
          hint={day.loading ? "Checking what's free…" : undefined}
        >
          <option value="">Choose a time</option>
          {SLOTS.map((start) => {
            const problem = slotProblem(start, length, date, booked, initial?.id);
            const value = minutesToTime(start);
            return (
              <option key={value} value={value} disabled={!!problem}>
                {formatTime(parseLocal(`${date}T${value}`))}
                {problem === "booked" ? " — booked" : ""}
              </option>
            );
          })}
        </Select>
      </Card>

      <Card className="flex flex-col gap-4 p-4 sm:p-6">
        <CardHeader title="Price" />
        <MoneyInput
          id="price"
          label="Price"
          placeholder="0.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errors.price}
        />
      </Card>

      {formError && <ErrorCallout message={formError} />}

      <div className="flex sm:justify-end">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
