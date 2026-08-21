import { NextResponse } from "next/server";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/db/schema";
import { asc } from "drizzle-orm";
import { eventsToICal } from "@/lib/ical";

export const dynamic = "force-dynamic";

export async function GET() {
  await connection();
  const rows = await db.select().from(events).orderBy(asc(events.startAt));
  const ics = eventsToICal(rows);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="agenda.ics"',
    },
  });
}
