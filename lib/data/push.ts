import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { pushSubscriptions, type PushSubscriptionRow } from "@/db/schema";

export type PushSubscriptionInsert = typeof pushSubscriptions.$inferInsert;

export async function listPushSubscriptions(): Promise<PushSubscriptionRow[]> {
  await connection();
  return db.select().from(pushSubscriptions);
}

export async function upsertPushSubscription(
  data: PushSubscriptionInsert,
): Promise<void> {
  await connection();
  await db
    .insert(pushSubscriptions)
    .values(data)
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: data.p256dh, auth: data.auth },
    });
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await connection();
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
}
