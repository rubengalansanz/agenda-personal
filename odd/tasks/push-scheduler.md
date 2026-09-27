# Feature: push-scheduler (notificaciones server-side)

## Objective
Cerrar la fase 8 del plan: scheduler que envía Web Push de recordatorios debidos sin depender del cliente abierto, más endpoint protegido para cron externo. Resuelve además la carpeta vacía `app/api/notify/`.

## Problem
- Hoy los pushes solo salen si el cliente tiene la app abierta (`PushProvider` hace polling cada 30s). Sin scheduler server-side no hay recordatorios con la app cerrada.
- `app/api/notify/` está vacía; no hay `scripts/notify.*` ni `node-cron` en `package.json`.
- La lógica de envío ya existe (`lib/push.ts:notifyDueReminders` + `listDueReminders` con ventana de 30 min); falta el disparador.

## Why
Es la segunda promesa CORE sin cumplir del plan original (la primera era el export ICS, ya cerrado). Sin esto las notificaciones no sirven como recordatorios de verdad.

## Scope
- `app/api/notify/route.ts` (nuevo): `POST /api/notify` protegido por `NOTIFY_SECRET` (header `Authorization: Bearer <secret>`); llama a `notifyDueReminders()` y devuelve `{ sent }`. Sin secret configurado → 503 (fail closed). Resuelve la carpeta vacía.
- `scripts/notify.mjs` (nuevo): scheduler `node-cron` cada 5 min que llama al endpoint local con el secret. `.mjs` en vez del `.ts` del plan: sin runner TS instalado, `.mjs` corre con `node` directo y evita resolver el alias `@/` fuera de Next.
- `package.json`: dependencia `node-cron` + script `npm run notify`.
- `README.md`: nota mínima de `NOTIFY_SECRET` + cómo correr el scheduler (3-4 líneas).
- Verificación: `npm run typecheck` + `npm run lint` + `npm run build` + smoke del endpoint contra dev server.

## Out of scope
- `app/api/push/subscribe/route.ts` del plan §4: la suscripción ya funciona vía Server Actions (`subscribePushAction`), el route sería redundante.
- Pulido (`error.tsx`/zod/tests), VAPID en producción/HTTPS.

## Constraints
- Next 16: route handler con `connection()` donde acceda a DB (vía `lib/push.ts`, que ya lo hace).
- Nunca loguear ni exponer el secret; comparar en tiempo constante no es crítico acá, pero no devolver pistas en errores.
- `agenda.db*` y `.env.local` no se commitean (ya en `.gitignore`).

## Tasks
- [ ] T1 (`notify-route`): crear `app/api/notify/route.ts`. Acceptance: con Bearer válido → `{ sent: number }`; sin secret env → 503; Bearer inválido → 401.
- [ ] T2 (`scheduler-script`): crear `scripts/notify.mjs` + dep `node-cron` + script `notify`. Acceptance: `node scripts/notify.mjs` corre sin error de sintaxis; llama al endpoint cada 5 min (verificable por log).
- [ ] T3 (`docs-verify-commit`): nota README + typecheck/lint/build + smoke endpoint + commit work-unit en rama feature.

## Authorized scope
Implementación autorizada por el usuario ("sigue con el scheduler de pushes"). Archivos tocables: `app/api/notify/route.ts` (nuevo), `scripts/notify.mjs` (nuevo), `package.json` + `package-lock.json` (dep + script), `README.md` (nota mínima), este documento + mirror en Engram. Nada fuera de eso sin nueva autorización.

## TDD
- Resolved mode: OFF. Source: `package.json` sin runner de tests (sin script `test`, sin vitest/jest).
- Checks aplicables: `npm run typecheck`, `npm run lint`, `npm run build` + smoke manual del endpoint.

## Delivery
- Forecast: ~80 líneas autoradas (muy por debajo del budget de 400). Strategy: `ask-on-risk` (default); no requiere split ni chain.

## Route declaration
- Por tarea: T1 inline, T2 inline, T3 inline.
- Trigger evidence: writer trigger (2 archivos nuevos no-triviales) pediría writer delegado, pero el runtime actual rechaza subagentes ("free tier can only be used from within OpenCode", ver `odd/tasks/export-ics.md`). Ruta inline declarada como fallback observable, en lotes chicos.

## Progress
- T1 done: `app/api/notify/route.ts` — `POST /api/notify` con Bearer `NOTIFY_SECRET`; sin secret → 503, Bearer inválido → 401, válido → `{ sent }`.
- T2 done: `scripts/notify.mjs` (cron cada 5 min contra el endpoint) + `node-cron@^4.6.0` + script `npm run notify`. `.mjs` en vez de `.ts` (sin runner TS; corre con `node` directo).
- T3 done: nota README + typecheck/lint/build + smoke endpoint + script (ver evidencia). Mirror Engram pendiente (servidor Engram no confirmó registro de sesión; reintentar en próxima sesión).

## Verification evidence
- `npm run typecheck` → pass (exit 0, sin output).
- `npm run lint` → pass (exit 0, sin output).
- Smoke endpoint contra dev server con `DB_FILE` temporal vacía (sin tocar datos reales ni mandar pushes): sin auth → 401; Bearer wrong → 401; Bearer válido → 200 `{"sent":0}`; sin `NOTIFY_SECRET` en env → 503 `{"error":"NOTIFY_SECRET no configurado"}`.
- `node --check scripts/notify.mjs` → OK; sin secret → exit 1 con mensaje (fail fast).
- `npm run build` → Compiled successfully, 12 rutas incl. `ƒ /api/notify` + postbuild OK.
- Nota: el primer server de smoke no murió con `kill $SRV` (quedó el wrapper); se detuvo con kill explícito + `pkill -f`. Los procesos `next-server v16.2.11` ajenos no se tocaron (otro proyecto).
- Commit work-unit: `b9e2dc6` en rama `feature/push-scheduler` (hook Guardian Angel: review PASSED). Merge a master + push pendientes (decisión tuya).
