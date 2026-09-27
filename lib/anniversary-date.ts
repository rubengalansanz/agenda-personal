/** Shared month/day parsing for anniversary dates.
 * Storage holds full ISO (`1990-05-14T00:00:00.000Z`, from `dateToIso`),
 * while legacy rows may hold bare `MM-DD`. Both are accepted here so
 * readers never have to guess the stored shape. Invalid dates → null.
 */

export function isValidDate(
  year: number,
  month: number,
  day: number,
): boolean {
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

export function parseMonthDay(
  date: string,
): { month: number; day: number } | null {
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31)
      return { month, day };
    return null;
  }
  const bare = date.match(/^(\d{1,2})-(\d{1,2})$/);
  if (bare) {
    const month = Number(bare[1]);
    const day = Number(bare[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31)
      return { month, day };
  }
  return null;
}
