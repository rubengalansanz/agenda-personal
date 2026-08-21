"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PushProvider } from "@/components/push/PushProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

type Section = { href: string; label: string; icon: string };

const sections: Section[] = [
  { href: "/calendario", label: "Calendario", icon: "M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  { href: "/tareas", label: "Tareas", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { href: "/contactos", label: "Contactos", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { href: "/notas", label: "Notas", icon: "M4 4h16v16H4zM8 9h8M8 13h8M8 17h5" },
  { href: "/cumpleanos", label: "Cumpleaños", icon: "M20 12v9H4v-9M2 7h20v5H2zM12 22V7M7 7S7 3 12 3s5 4 5 4" },
  { href: "/planner", label: "Planner", icon: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex h-14 items-center justify-between gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <span className="text-lg font-semibold tracking-tight">Agenda</span>
        <ThemeToggle />
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {sections.map((s) => {
          const active =
            pathname === s.href || pathname.startsWith(`${s.href}/`);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-zinc-700 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <NavIcon d={s.icon} />
              {s.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-zinc-200 p-1 dark:border-zinc-800">
        <PushProvider />
      </div>
    </aside>
  );
}
