export function str(v: FormDataEntryValue | null): string {
  return v == null ? "" : String(v).trim();
}

export function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

export function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (s === "") return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

export function boolVal(v: FormDataEntryValue | null): boolean {
  return v != null && String(v) === "on";
}
