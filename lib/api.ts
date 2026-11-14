import type { Appointment, AppointmentRequest, PaymentRequest, PaymentStats } from "./types";

/** Next proxies /api/* to the backend (see next.config.ts). */
const API_BASE_URL = "/api/v1";

export class ApiError extends Error {
  /** Per-field validation messages, keyed by request field name. */
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

/** The backend returns RFC 9457 problem details: { detail, errors? }. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const errors = body?.errors ?? {};
    const message = Object.keys(errors).length ? "Please fix the highlighted fields." : body?.detail;
    throw new ApiError(message ?? "Something went wrong. Please try again.", errors);
  }
  return body as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) });

export const appointmentApi = {
  create: (input: AppointmentRequest) => post<string>("/appointment", input),
  update: (id: string, input: AppointmentRequest) => put<string>(`/appointment/${id}`, input),

  today: () => get<Appointment[]>("/appointment/today"),
  tomorrow: () => get<Appointment[]>("/appointment/tomorrow"),
  /** Dates are "yyyy-MM-dd", both inclusive. */
  between: (fromDate: string, toDate: string) => get<Appointment[]>(`/appointment/from/${fromDate}/to/${toDate}`),

  /** The backend has no get-by-id endpoint, so look it up in the full list. */
  async getById(id: string): Promise<Appointment> {
    const all = await get<Appointment[]>("/appointment");
    const found = all.find((a) => a.id === id);
    if (!found) throw new ApiError("This appointment doesn't exist anymore.");
    return found;
  },

  recordPayment: (id: string, input: PaymentRequest) => put<string>(`/appointment/${id}/payment`, input),
};

export const statsApi = {
  today: () => get<PaymentStats>("/payment/stats/today"),
  /** Month is "yyyy-MM". */
  month: (month: string) => get<PaymentStats>(`/payment/stats/month/${month}`),
};
