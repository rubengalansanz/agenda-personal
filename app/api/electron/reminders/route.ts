import { NextResponse } from "next/server";
import { listDueReminders } from "@/lib/data/reminders";

export const dynamic = "force-dynamic";

export async function GET() {
  const due = await listDueReminders();
  return NextResponse.json(due);
}
