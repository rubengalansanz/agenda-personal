import type { EventRow } from "@/db/schema";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toICSDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function eventsToICal(events: EventRow[]): string {
  const stamp = toICSDate(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agenda Personal//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const e of events) {
    const start = new Date(e.startAt);
    if (Number.isNaN(start.getTime())) continue;
    const end = e.endAt ? new Date(e.endAt) : new Date(start.getTime() + 60 * 60 * 1000);

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id}@agenda.local`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART:${toICSDate(start)}`);
    lines.push(`DTEND:${toICSDate(end)}`);
    if (e.title) lines.push(`SUMMARY:${escapeICS(e.title)}`);
    if (e.location) lines.push(`LOCATION:${escapeICS(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeICS(e.description)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
