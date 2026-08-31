import { BrowserWindow, Notification } from "electron";

const POLL_INTERVAL = 30_000;
const PORT = 3456;
const notifiedKeys = new Set<string>();
let intervalId: ReturnType<typeof setInterval> | null = null;

interface DueReminder {
  kind: "event" | "anniversary";
  id: number;
  title: string;
}

async function fetchDueReminders(): Promise<DueReminder[]> {
  try {
    const res = await fetch(`http://localhost:${PORT}/api/electron/reminders`);
    if (!res.ok) return [];
    return (await res.json()) as DueReminder[];
  } catch {
    return [];
  }
}

export function setupNotifications(mainWindow: BrowserWindow | null): void {
  if (!mainWindow) return;

  const tick = async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    try {
      const due = await fetchDueReminders();

      for (const d of due) {
        const key = `${d.kind}:${d.id}`;
        if (notifiedKeys.has(key)) continue;
        notifiedKeys.add(key);

        if (Notification.isSupported()) {
          const notification = new Notification({
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
    } catch (err) {
      console.error("Notification poll error:", err);
    }
  };

  void tick();
  intervalId = setInterval(tick, POLL_INTERVAL);
}

export function stopNotifications(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  notifiedKeys.clear();
}
