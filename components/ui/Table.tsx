import type { TableHTMLAttributes, ReactNode } from "react";

export function Table({
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`} {...props} />
    </div>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-zinc-100 px-3 py-2 align-top dark:border-zinc-900 ${className}`}
    >
      {children}
    </td>
  );
}
