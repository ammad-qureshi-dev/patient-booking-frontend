import type { ReactNode } from "react";

/**
 * Segmented control: a gray track with the selected option raised as a surface pill.
 * Options share the full width so each one is an easy thumb target.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full gap-0.5 rounded-[10px] bg-subtle p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-10 flex-1 whitespace-nowrap rounded-lg px-2 text-sm font-medium transition-colors ${
              active ? "bg-surface text-fg shadow-[0_0_0_1px_var(--color-line)]" : "text-muted hover:text-fg"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
