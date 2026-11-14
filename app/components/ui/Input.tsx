import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = { label: string; error?: string; hint?: string };

/** Label above, hint or error below. Labels are never placeholders. */
export function Field({ label, error, hint, htmlFor, children }: FieldProps & { htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] text-muted">
        {label}
      </label>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

// 16px text stops iOS Safari from zooming in when a field is focused.
export const fieldClass =
  "min-h-12 w-full rounded-[10px] border border-line bg-surface px-3.5 font-sans text-base text-fg outline-none transition-colors placeholder:text-faint hover:border-line-strong focus:border-fg";

export function Input({ label, error, hint, id, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id}>
      <input id={id} className={`${fieldClass} ${className}`} {...props} />
    </Field>
  );
}

/** A dollar amount field that brings up the decimal keypad on phones. */
export function MoneyInput({ label, error, hint, id, ...props }: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-muted">$</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`${fieldClass} tabular-ticker pl-7`}
          {...props}
        />
      </div>
    </Field>
  );
}

export function Textarea({ label, error, hint, id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id}>
      <textarea id={id} className={`${fieldClass} min-h-24 resize-y py-3`} {...props} />
    </Field>
  );
}

export function Select({ label, error, hint, id, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id}>
      <select id={id} className={fieldClass} {...props}>
        {children}
      </select>
    </Field>
  );
}

/** Inline error callout for a form or a failed load. */
export function ErrorCallout({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-[10px] bg-danger-soft px-3.5 py-3 text-sm text-danger">
      {message}
    </p>
  );
}
