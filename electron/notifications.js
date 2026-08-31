"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupNotifications = setupNotifications;
exports.stopNotifications = stopNotifications;
const electron_1 = require("electron");
const POLL_INTERVAL = 30000;
const PORT = 3456;
const notifiedKeys = new Set();
let intervalId = null;
async function fetchDueReminders() {
    try {
        const res = await fetch(`http://localhost:${PORT}/api/electron/reminders`);
        if (!res.ok)
            return [];
        return (await res.json());
    }
    catch {
        return [];
    }
}
function setupNotifications(mainWindow) {
    if (!mainWindow)
        return;
    const tick = async () => {
        if (!mainWindow || mainWindow.isDestroyed())
            return;
        try {
            const due = await fetchDueReminders();
            for (const d of due) {
                const key = `${d.kind}:${d.id}`;
                if (notifiedKeys.has(key))
                    continue;
                notifiedKeys.add(key);
                if (electron_1.Notification.isSupported()) {
                    const notification = new electron_1.Notification({
                        title: "Agenda · Recordatorio",
                        body: d.title,
                    });
                    notification.on("click", () => {
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.focus();
                            mainWindow.webContents.send("navigate", "/calendario");
                        }
                    });
                    notification.show();
                }
            }
        }
        catch (err) {
            console.error("Notification poll error:", err);
        }
    };
    void tick();
    intervalId = setInterval(tick, POLL_INTERVAL);
}
function stopNotifications() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    notifiedKeys.clear();
}
//# sourceMappingURL=notifications.js.map