import type { ReactNode } from "react";

/**
 * Segmented control: a gray track with the selected option as a solid `fg` pill, so the
 * choice is obvious at a glance in both themes.
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
              active ? "bg-fg text-surface" : "text-muted hover:text-fg"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
