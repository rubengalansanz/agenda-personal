import { NextResponse } from "next/server";
import { notifyDueReminders } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET() {
  const sent = await notifyDueReminders();
  return NextResponse.json({ sent });
}
