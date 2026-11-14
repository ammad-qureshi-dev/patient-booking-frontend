import type { AppointmentLength } from "./types";

// The backend sends local date-times with no zone ("2026-11-15T09:30:00") and plain dates
// ("2026-11-15"). These helpers build and read those strings without any timezone shifting.

const pad = (n: number) => String(n).padStart(2, "0");

export const LENGTHS: { value: AppointmentLength; label: string; minutes: number }[] = [
  { value: "HALF_HOUR", label: "30 min", minutes: 30 },
  { value: "ONE_HOUR", label: "1 hr", minutes: 60 },
  { value: "ONE_AND_A_HALF_HOUR", label: "1.5 hr", minutes: 90 },
  { value: "TWO_HOUR", label: "2 hr", minutes: 120 },
];

export function lengthLabel(length: AppointmentLength): string {
  return LENGTHS.find((l) => l.value === length)?.label ?? length;
}

export function lengthMinutes(length: AppointmentLength): number {
  return LENGTHS.find((l) => l.value === length)?.minutes ?? 0;
}

/** Date -> "yyyy-MM-dd" in local time. */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Date -> "yyyy-MM". */
export function toMonthString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** "yyyy-MM-dd" or "yyyy-MM-ddTHH:mm[:ss]" -> local Date. */
export function parseLocal(value: string): Date {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

/** Minutes since midnight -> "HH:mm" (the value used by the time picker). */
export function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** "09:30" -> 570. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** "9:30 AM" */
export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? parseLocal(value) : value;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** "9:00 – 10:30 AM", or "11:30 AM – 12:30 PM" when it crosses noon. */
export function formatTimeRange(start: string, end: string): string {
  const from = formatTime(start);
  const to = formatTime(end);
  const sameHalf = from.slice(-2) === to.slice(-2);
  return `${sameHalf ? from.slice(0, -3) : from} – ${to}`;
}

/** "Sat, Nov 15" */
export function formatDay(value: string | Date): string {
  const date = typeof value === "string" ? parseLocal(value) : value;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** "November 2026" */
export function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
