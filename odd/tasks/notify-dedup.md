# Feature: notify-dedup (un push por recordatorio por ventana)

## Objective
Evitar pushes repetidos del mismo recordatorio mientras sigue dentro de la ventana de 30 min de `listDueReminders` (hoy cada tick — 5 min del scheduler o 30s del cliente — reenvía todo lo debido).

## Problem
`notifyDueReminders()` envía en cada llamada un push con TODOS los recordatorios debidos, sin memoria de lo ya enviado. Con el scheduler cada 5 min, un recordatorio genera ~6 pushes en 30 min. El cliente (`PushProvider` cada 30s) tiene el mismo problema cuando está suscrito.

## Why
Sin esto el scheduler molesta en vez de ayudar: spam de notificaciones idénticas.

## Scope
- `lib/push.ts:notifyDueReminders`: memoria server-side (Map en módulo `reminderKey → epochMs` del último envío); filtra los debidos ya notificados dentro de la ventana; si no hay nada nuevo, devuelve 0 sin enviar; si hay, envía solo los nuevos y registra. Podar entradas viejas para no crecer sin cota.
- Limitation documentada: la memoria es en proceso — un reinicio del servidor puede reenviar una vez por ventana. Aceptable para uso personal single-instance.
- Verificación: `npm run typecheck` + `npm run lint` + `npm run build`.

## Out of scope
- Persistir en DB, ventana configurable, cambios en cliente o scheduler.

## Constraints
- No cambiar la firma de `notifyDueReminders()` (la usan el route y la Server Action sin args).
- No romper `sendTestPush` ni el payload existente.

## Tasks
- [ ] T1 (`dedup`): implementar memoria de enviados en `notifyDueReminders`. Acceptance: 2da llamada consecutiva con los mismos debidos → 0 sin enviar; un debido nuevo → se envía solo él.
- [ ] T2 (`verify-commit`): typecheck + lint + build en verde; commit work-unit en rama feature.

## Authorized scope
Implementación autorizada por el usuario ("te pones con la tarea que has propuesto"). Archivos tocables: `lib/push.ts`, este documento + mirror en Engram. Nada fuera de eso sin nueva autorización.

## TDD
- Resolved mode: OFF. Source: `package.json` sin runner de tests.
- Checks aplicables: `npm run typecheck`, `npm run lint`, `npm run build` (ordinarios, no TDD).

## Delivery
- Forecast: ~20 líneas autoradas. Strategy: `ask-on-risk` (default).

## Route declaration
- Por tarea: T1 inline, T2 inline.
- Trigger evidence: cambio de 1 archivo no-trivial ya comprendido → inline directo, sin delegación.

## Progress
- T1 done: `lib/push.ts:notifyDueReminders` con memoria en proceso (`kind:id → epochMs`, ventana 30 min, poda de viejas). Solo envía debidos nuevos; registra solo si al menos un envío tuvo éxito; sin suscripciones no registra (reintenta próximo tick).
- T2 done: typecheck + lint + build en verde (ver evidencia). Mirror Engram pendiente (mismo motivo que features anteriores).

## Verification evidence
- `npm run typecheck` → pass (exit 0, sin output).
- `npm run lint` → pass (exit 0, sin output).
- `npm run build` → Compiled successfully, 12 rutas + postbuild OK.
- Lógica verificada por lectura (sin harness de tests en el repo): filtro por `lastNotified`, poda acotada, registro solo con `sent > 0`. Sin smoke live (requeriría suscripciones push reales).
