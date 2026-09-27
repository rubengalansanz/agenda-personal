import { NextResponse } from "next/server";
import { notifyDueReminders } from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * POST /api/notify — dispara el envío de Web Push para recordatorios debidos.
 * Protegido por `NOTIFY_SECRET` (header `Authorization: Bearer <secret>`).
 * Pensado para un cron externo en producción y para `scripts/notify.mjs` en local.
 * Sin secret configurado → 503 (fail closed, no se expone nada).
 */
export async function POST(req: Request) {
  const secret = process.env.NOTIFY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "NOTIFY_SECRET no configurado" },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const sent = await notifyDueReminders();
  return NextResponse.json({ sent });
}
