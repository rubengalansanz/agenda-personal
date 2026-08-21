"use client";

import { useEffect, useRef, useState } from "react";
import {
  subscribePushAction,
  notifyDueRemindersAction,
  listDueRemindersAction,
} from "@/app/actions/push";
import { useToast } from "@/components/ui";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type Status = "loading" | "unsupported" | "default" | "granted" | "denied" | "subscribed";

export function PushProvider() {
  const [status, setStatus] = useState<Status>("loading");
  const toast = useToast();
  const regRef = useRef<ServiceWorkerRegistration | null>(null);
  const notified = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      Promise.resolve().then(() => setStatus("unsupported"));
      return;
    }
    let cancelled = false;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => navigator.serviceWorker.ready.then(() => reg))
      .then((reg) => {
        if (cancelled) return;
        regRef.current = reg;
        const perm = Notification.permission;
        if (perm === "granted") {
          return reg.pushManager
            .getSubscription()
            .then((sub) => {
              if (!cancelled) setStatus(sub ? "subscribed" : "granted");
            })
            .catch(() => {
              if (!cancelled) setStatus("granted");
            });
        }
        if (!cancelled) setStatus(perm as Status);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "loading" || status === "unsupported") return;
    const tick = async () => {
      const due = await listDueRemindersAction();
      for (const d of due) {
        const key = `${d.kind}:${d.id}`;
        if (notified.current.has(key)) continue;
        notified.current.add(key);
        if (status === "subscribed" && regRef.current) {
          await notifyDueRemindersAction();
        } else if (regRef.current && regRef.current.active) {
          regRef.current.active.postMessage({
            type: "local-notification",
            title: "Agenda · Recordatorio",
            body: d.title,
            tag: key,
          });
        }
      }
    };
    void tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [status]);

  const enable = async () => {
    if (!regRef.current || !VAPID_PUBLIC_KEY) return;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setStatus("denied");
      toast("Permiso de notificaciones denegado");
      return;
    }
    const sub = await regRef.current.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });
    const raw = sub.toJSON() as unknown as StoredSubscriptionInput;
    await subscribePushAction({
      endpoint: raw.endpoint,
      keys: raw.keys,
    });
    setStatus("subscribed");
    toast("Recordatorios activados");
  };

  if (status === "unsupported") {
    return (
      <p className="px-3 py-2 text-xs text-zinc-400">
        Notificaciones no soportadas en este navegador.
      </p>
    );
  }

  if (status === "subscribed") {
    return (
      <p className="px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
        ● Recordatorios activos
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      className="mx-3 mb-2 rounded-md border border-zinc-200 px-3 py-2 text-left text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
    >
      {status === "denied"
        ? "Notificaciones bloqueadas (cámbialo en el navegador)"
        : "Activar recordatorios"}
    </button>
  );
}

type StoredSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};
