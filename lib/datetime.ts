export function isoToDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalToIso(v?: FormDataEntryValue | null): string {
  if (!v || typeof v !== "string") return new Date().toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function isoToDate(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function dateToIso(v?: FormDataEntryValue | null): string {
  if (!v || typeof v !== "string") return "";
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}
