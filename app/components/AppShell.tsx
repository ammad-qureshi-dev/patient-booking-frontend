"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Moon, Plus, Sun, Wallet, type LucideIcon } from "lucide-react";
import { toggleTheme } from "@/lib/theme";

type NavItem = { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean };

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Schedule",
    icon: CalendarDays,
    match: (p) => p === "/" || (p.startsWith("/appointments/") && p !== "/appointments/new"),
  },
  { href: "/appointments/new", label: "Book", icon: Plus, match: (p) => p === "/appointments/new" },
  { href: "/earnings", label: "Earnings", icon: Wallet, match: (p) => p.startsWith("/earnings") },
];

/** Shows a sun in dark mode (switch to light) and a moon in light mode, driven purely by CSS. */
function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-fg hover:bg-subtle"
    >
      <Sun className="h-[18px] w-[18px] light:hidden" strokeWidth={1.75} />
      <Moon className="hidden h-[18px] w-[18px] light:block" strokeWidth={1.75} />
    </button>
  );
}

/**
 * Phones: a slim top bar and a bottom tab bar within thumb reach.
 * Wider screens: the same tabs move into the top bar and the bottom bar hides.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-surface sm:bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-6 px-4">
          <Link href="/" className="text-[19px] font-semibold tracking-[-0.03em] text-fg">
            Appointments
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-9 items-center rounded-[10px] border px-3 text-sm ${
                    active ? "border-line bg-surface text-fg shadow-[0_1px_2px_rgba(0,0,0,0.04)]" : "border-transparent text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Bottom padding leaves room for the tab bar (and the iPhone home indicator). */}
      <main className="mx-auto max-w-2xl px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-5 sm:my-6 sm:rounded-2xl sm:border sm:border-line sm:bg-surface sm:px-8 sm:py-8">
        {children}
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-3">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${
                  active ? "text-fg" : "text-muted"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
