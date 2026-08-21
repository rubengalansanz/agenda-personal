self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Agenda", body: "", tag: "agenda", url: "/" };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch {
    /* ignore malformed payloads */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});

// Fallback local: la página pide mostrar una notificación sin push.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "local-notification") return;
  event.waitUntil(
    self.registration.showNotification(data.title || "Agenda", {
      body: data.body || "",
      tag: data.tag || "agenda",
    }),
  );
});
