import webpush from "web-push";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/db/schema";
import { listDueReminders } from "@/lib/data/reminders";

export type StoredSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !subj) return false;
  webpush.setVapidDetails(subj, pub, priv);
  configured = true;
  return true;
}

export function getVapidPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
}

async function getSubscriptions(): Promise<StoredSubscription[]> {
  await connection();
  const rows = await db.select().from(pushSubscriptions);
  return rows.map((r) => ({
    endpoint: r.endpoint,
    keys: { p256dh: r.p256dh, auth: r.auth },
  }));
}

export async function saveSubscription(sub: StoredSubscription): Promise<void> {
  ensureConfigured();
  await connection();
  const existing = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, sub.endpoint))
    .limit(1);
  if (existing.length > 0) return;
  await db.insert(pushSubscriptions).values({
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await connection();
  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function sendPush(
  sub: StoredSubscription,
  payload: unknown,
): Promise<boolean> {
  if (!ensureConfigured()) return false;
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await removeSubscription(sub.endpoint);
    }
    return false;
  }
}

/** Memoria en proceso de recordatorios ya notificados (`kind:id` → epoch ms).
 * Evita reenviar el mismo recordatorio en cada tick mientras sigue dentro de
 * la ventana de `listDueReminders`. Se pierde al reiniciar el servidor
 * (aceptable para uso personal: a lo sumo un reenvío por ventana). */
const lastNotified = new Map<string, number>();
const DEDUP_WINDOW_MS = 30 * 60_000;

/** Envía push a todas las suscripciones guardadas para los recordatorios debidos.
 * Solo envía los debidos no notificados en la ventana actual; si no hay nada
 * nuevo, no envía nada y devuelve 0. */
export async function notifyDueReminders(): Promise<number> {
  if (!ensureConfigured()) return 0;
  const due = await listDueReminders();
  if (due.length === 0) return 0;
  const now = Date.now();
  const fresh = due.filter((d) => {
    const last = lastNotified.get(`${d.kind}:${d.id}`);
    return last == null || now - last > DEDUP_WINDOW_MS;
  });
  for (const [key, at] of lastNotified) {
    if (now - at > DEDUP_WINDOW_MS) lastNotified.delete(key);
  }
  if (fresh.length === 0) return 0;
  const subs = await getSubscriptions();
  if (subs.length === 0) return 0;
  const payload = {
    title: "Agenda · Recordatorio",
    body: fresh.map((d) => d.title).join(", "),
    tag: "agenda-reminders",
    url: "/calendario",
  };
  let sent = 0;
  for (const s of subs) {
    if (await sendPush(s, payload)) sent += 1;
  }
  if (sent > 0) {
    for (const d of fresh) lastNotified.set(`${d.kind}:${d.id}`, now);
  }
  return sent;
}

/** Envía una notificación de prueba a todas las suscripciones. */
export async function sendTestPush(): Promise<number> {
  if (!ensureConfigured()) return 0;
  const subs = await getSubscriptions();
  if (subs.length === 0) return 0;
  const payload = {
    title: "Agenda · Prueba",
    body: "Las notificaciones push funcionan correctamente.",
    tag: "agenda-test",
    url: "/",
  };
  let sent = 0;
  for (const s of subs) {
    if (await sendPush(s, payload)) sent += 1;
  }
  return sent;
}
