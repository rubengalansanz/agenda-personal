"use client";

import { useEffect, useRef, useState } from "react";
import {
  subscribePushAction,
  notifyDueRemindersAction,
  listDueRemindersAction,
} from "@/app/actions/push";
import { useToast } from "@/components/ui";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      showNotification: (title: string, body: string) => Promise<void>;
    };
  }
}

type Status =
  | "loading"
  | "unsupported"
  | "default"
  | "granted"
  | "denied"
  | "subscribed"
  | "electron";

export function PushProvider() {
  const [status, setStatus] = useState<Status>("loading");
  const toast = useToast();
  const regRef = useRef<ServiceWorkerRegistration | null>(null);
  const notified = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI?.isElectron) {
      queueMicrotask(() => setStatus("electron"));
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      queueMicrotask(() => setStatus("unsupported"));
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
    if (status === "loading" || status === "unsupported" || status === "electron")
      return;
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

  if (status === "loading" || status === "electron") {
    return status === "electron" ? (
      <p className="px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
        ● Recordatorios activos (nativo)
      </p>
    ) : (
      <p className="px-3 py-2 text-xs text-zinc-400">Cargando...</p>
    );
  }

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

  function enable() {
    if (!regRef.current || !VAPID_PUBLIC_KEY) return;
    Notification.requestPermission().then((perm) => {
      if (perm !== "granted") {
        setStatus("denied");
        toast("Permiso de notificaciones denegado");
        return;
      }
      regRef.current!.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        })
        .then((sub) => {
          const raw = sub.toJSON() as unknown as StoredSubscriptionInput;
          return subscribePushAction({
            endpoint: raw.endpoint,
            keys: raw.keys,
          });
        })
        .then(() => {
          setStatus("subscribed");
          toast("Recordatorios activados");
        });
    });
  }
}

type StoredSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};
