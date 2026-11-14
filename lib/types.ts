// Mirrors the patient-booking backend's request/response records.

export type AppointmentStatus = "CONFIRMED" | "CANCELLED";

export type AppointmentLength = "HALF_HOUR" | "ONE_HOUR" | "ONE_AND_A_HALF_HOUR" | "TWO_HOUR";

export type PaymentType = "CASH" | "E_TRANSFER";

export type Appointment = {
  id: string;
  fullName: string;
  notes: string | null;
  price: number;
  status: AppointmentStatus;
  length: AppointmentLength;
  /** Local date-time without a zone, e.g. "2026-11-15T09:30:00". */
  startTime: string;
  endTime: string;
};

export type AppointmentRequest = {
  fullName: string;
  notes?: string;
  price: number;
  startTime: string;
  length: AppointmentLength;
};

export type PaymentRequest = {
  amountReceived: number;
  tipAmount?: number;
  type: PaymentType;
};

export type PaymentTotals = {
  paymentCount: number;
  beforeTips: number;
  tips: number;
  withTips: number;
};

export type PaymentStats = {
  fromDate: string;
  toDate: string;
  total: PaymentTotals;
  byPaymentType: Record<PaymentType, PaymentTotals>;
  /** Keyed by "yyyy-MM-dd"; only days with payments are present. */
  byDay: Record<string, PaymentTotals>;
};
