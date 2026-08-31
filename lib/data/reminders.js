"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReminderSources = listReminderSources;
exports.listDueReminders = listDueReminders;
const drizzle_orm_1 = require("drizzle-orm");
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const schema_1 = require("@/db/schema");
/** Fuentes con recordatorio configurado (eventos y aniversarios). */
async function listReminderSources() {
    await (0, server_1.connection)();
    const evs = await db_1.db
        .select({
        id: schema_1.events.id,
        title: schema_1.events.title,
        startAt: schema_1.events.startAt,
        reminderMin: schema_1.events.reminderMin,
    })
        .from(schema_1.events)
        .where((0, drizzle_orm_1.isNotNull)(schema_1.events.reminderMin));
    const anns = await db_1.db
        .select({
        id: schema_1.anniversaries.id,
        name: schema_1.anniversaries.name,
        date: schema_1.anniversaries.date,
        reminderMin: schema_1.anniversaries.reminderMin,
    })
        .from(schema_1.anniversaries)
        .where((0, drizzle_orm_1.isNotNull)(schema_1.anniversaries.reminderMin));
    return [
        ...evs.map((e) => ({
            kind: "event",
            id: e.id,
            title: e.title,
            startAt: e.startAt,
            reminderMin: e.reminderMin,
        })),
        ...anns.map((a) => ({
            kind: "anniversary",
            id: a.id,
            title: a.name,
            date: a.date,
            reminderMin: a.reminderMin,
        })),
    ];
}
function eventDueAt(startAt, reminderMin) {
    if (reminderMin == null)
        return null;
    const d = new Date(startAt);
    if (Number.isNaN(d.getTime()))
        return null;
    d.setMinutes(d.getMinutes() - reminderMin);
    return d;
}
function anniversaryDueAt(date, reminderMin) {
    if (reminderMin == null)
        return null;
    const parts = date.split("-").map(Number);
    const mm = parts[0];
    const dd = parts[1];
    if (!mm || !dd)
        return null;
    const now = new Date();
    const year = now.getFullYear();
    let d = new Date(year, mm - 1, dd, 9, 0, 0, 0);
    if (d.getTime() < now.getTime()) {
        d = new Date(year + 1, mm - 1, dd, 9, 0, 0, 0);
    }
    d.setMinutes(d.getMinutes() - reminderMin);
    return d;
}
/** Recordatorios cuya alerta corresponde en la ventana actual. */
async function listDueReminders(now = new Date(), windowMin = 30) {
    const sources = await listReminderSources();
    const out = [];
    for (const s of sources) {
        const due = s.kind === "event"
            ? eventDueAt(s.startAt, s.reminderMin)
            : anniversaryDueAt(s.date, s.reminderMin);
        if (!due)
            continue;
        const diffMs = now.getTime() - due.getTime();
        if (diffMs >= 0 && diffMs <= windowMin * 60000) {
            out.push({ kind: s.kind, id: s.id, title: s.title, dueAt: due });
        }
    }
    return out;
}
//# sourceMappingURL=reminders.js.map