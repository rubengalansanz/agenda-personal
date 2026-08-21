import { and, asc, eq, lte, ne } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { plannerItems, type PlannerItemRow } from "@/db/schema";

export type PlannerItemInsert = typeof plannerItems.$inferInsert;

export async function listPlannerItems(
  projectId?: number,
): Promise<PlannerItemRow[]> {
  await connection();
  return db
    .select()
    .from(plannerItems)
    .where(projectId ? eq(plannerItems.projectId, projectId) : undefined)
    .orderBy(asc(plannerItems.dueDate), asc(plannerItems.priority));
}

/** Hitos pendientes con vencimiento hasta `toIso` (inclusive). Por defecto, 30 días. */
export async function listUpcomingPlannerItems(
  toIso?: string,
): Promise<PlannerItemRow[]> {
  const to = toIso ?? new Date(Date.now() + 30 * 86400000).toISOString();
  await connection();
  return db
    .select()
    .from(plannerItems)
    .where(and(ne(plannerItems.status, "done"), lte(plannerItems.dueDate, to)))
    .orderBy(asc(plannerItems.dueDate));
}

export async function getPlannerItem(
  id: number,
): Promise<PlannerItemRow | undefined> {
  await connection();
  const [row] = await db
    .select()
    .from(plannerItems)
    .where(eq(plannerItems.id, id));
  return row;
}

export async function createPlannerItem(
  data: PlannerItemInsert,
): Promise<PlannerItemRow> {
  await connection();
  const [row] = await db.insert(plannerItems).values(data).returning();
  return row;
}

export async function updatePlannerItem(
  id: number,
  data: Partial<PlannerItemInsert>,
): Promise<PlannerItemRow | undefined> {
  await connection();
  const [row] = await db
    .update(plannerItems)
    .set(data)
    .where(eq(plannerItems.id, id))
    .returning();
  return row;
}

export async function removePlannerItem(id: number): Promise<void> {
  await connection();
  await db.delete(plannerItems).where(eq(plannerItems.id, id));
}
