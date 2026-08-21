"use server";

import {
  saveSubscription,
  removeSubscription,
  notifyDueReminders,
  sendTestPush,
  type StoredSubscription,
} from "@/lib/push";
import { listDueReminders } from "@/lib/data/reminders";

export async function subscribePushAction(sub: StoredSubscription): Promise<void> {
  await saveSubscription(sub);
}

export async function unsubscribePushAction(endpoint: string): Promise<void> {
  await removeSubscription(endpoint);
}

export async function notifyDueRemindersAction(): Promise<number> {
  return notifyDueReminders();
}

export async function sendTestPushAction(): Promise<number> {
  return sendTestPush();
}

export async function listDueRemindersAction() {
  return listDueReminders();
}
