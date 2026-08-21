import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { anniversaries, type AnniversaryRow } from "@/db/schema";

export type AnniversaryInsert = typeof anniversaries.$inferInsert;
export type UpcomingAnniversary = AnniversaryRow & {
  nextDate: string;
  daysUntil: number;
};

/** Calcula la próxima ocurrencia anual de `MM-DD` dentro de [from, to]. */
export function nextOccurrence(
  date: string,
  from: Date,
  to: Date,
): string | null {
  const [mm, dd] = date.split("-");
  if (!mm || !dd) return null;
  for (const year of [from.getFullYear(), from.getFullYear() + 1]) {
    const candidate = new Date(year, Number(mm) - 1, Number(dd), 0, 0, 0, 0);
    if (candidate >= from && candidate <= to) {
      return candidate.toISOString();
    }
  }
  return null;
}

export async function listAnniversaries(): Promise<AnniversaryRow[]> {
  await connection();
  return db.select().from(anniversaries).orderBy(asc(anniversaries.date));
}

export async function listUpcomingAnniversaries(
  fromIso: string,
  toIso: string,
): Promise<UpcomingAnniversary[]> {
  await connection();
  const all = await db.select().from(anniversaries).orderBy(asc(anniversaries.date));
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const out: UpcomingAnniversary[] = [];
  for (const a of all) {
    const next = nextOccurrence(a.date, from, to);
    if (next) {
      const daysUntil = Math.ceil(
        (new Date(next).getTime() - from.getTime()) / 86400000,
      );
      out.push({ ...a, nextDate: next, daysUntil });
    }
  }
  return out;
}

/** Próximas ocurrencias anuales en los próximos `days` días (por defecto 365). */
export async function listAnniversariesWithNext(
  days = 365,
): Promise<UpcomingAnniversary[]> {
  const from = new Date();
  const to = new Date(Date.now() + days * 86400000);
  return listUpcomingAnniversaries(from.toISOString(), to.toISOString());
}

export async function getAnniversary(
  id: number,
): Promise<AnniversaryRow | undefined> {
  await connection();
  const [row] = await db
    .select()
    .from(anniversaries)
    .where(eq(anniversaries.id, id));
  return row;
}

export async function createAnniversary(
  data: AnniversaryInsert,
): Promise<AnniversaryRow> {
  await connection();
  const [row] = await db.insert(anniversaries).values(data).returning();
  return row;
}

export async function updateAnniversary(
  id: number,
  data: Partial<AnniversaryInsert>,
): Promise<AnniversaryRow | undefined> {
  await connection();
  const [row] = await db
    .update(anniversaries)
    .set(data)
    .where(eq(anniversaries.id, id))
    .returning();
  return row;
}

export async function removeAnniversary(id: number): Promise<void> {
  await connection();
  await db.delete(anniversaries).where(eq(anniversaries.id, id));
}
