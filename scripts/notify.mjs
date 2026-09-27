/**
 * Scheduler local de pushes (uso personal).
 * Cada 5 minutos llama a POST /api/notify con el secret y loguea cuántos
 * recordatorios se enviaron. La ventana de "debidos" (30 min) la define
 * `listDueReminders`, así que un tick de 5 min no duplica envíos: el servidor
 * solo envía los que caen en la ventana actual.
 *
 * Uso: NOTIFY_SECRET=... BASE_URL=http://localhost:3000 npm run notify
 */
import cron from "node-cron";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const SECRET = process.env.NOTIFY_SECRET;

if (!SECRET) {
  console.error("notify: falta NOTIFY_SECRET en el entorno. Abortando.");
  process.exit(1);
}

async function tick() {
  try {
    const res = await fetch(`${BASE_URL}/api/notify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    const body = await res.json().catch(() => ({}));
    console.log(
      `notify: ${new Date().toISOString()} status=${res.status} sent=${body.sent ?? "?"}`,
    );
  } catch (err) {
    console.error(`notify: tick fallido: ${err instanceof Error ? err.message : err}`);
  }
}

console.log(`notify: scheduler cada 5 min contra ${BASE_URL}/api/notify`);
void tick();
cron.schedule("*/5 * * * *", tick);
