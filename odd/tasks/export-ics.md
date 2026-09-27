# Feature: export ICS completo (/api/export/ics)

## Objective
Cerrar el export iCalendar a lo prometido en `agenda-personal.md` §5.9 y §7: ruta `/api/export/ics` global y por sección, con eventos (VEVENT), aniversarios recurrentes (VEVENT + `RRULE:FREQ=YEARLY`) y tareas (VTODO).

## Problem
Hoy `lib/ical.ts` solo genera VEVENT de eventos y la única ruta es `/api/calendar`. No se exportan cumpleaños/aniversarios ni tareas. `app/api/notify/` está vacía (scheduler, fuera de scope de este feature).

## Why
Es una de las dos promesas CORE sin cumplir del plan original (la otra es el scheduler de pushes). Sin esto la app no interoperopera con clientes de calendario.

## Scope
- `lib/ical.ts`: sumar aniversarios y tareas al generador (sin romper `eventsToICal` ni `/api/calendar`).
- `app/api/export/ics/route.ts`: nueva ruta `GET /api/export/ics` (global) y `?type=events|anniversaries|tasks` por sección.
- Verificación: `npm run typecheck` + `npm run lint`.

## Out of scope (siguientes features)
- Scheduler de pushes (`scripts/notify.ts`, `node-cron`, `app/api/notify/`).
- Pulido (`error.tsx`/`not-found.tsx`/`loading.tsx`, zod, tests).
- Higiene extra (los `.js` compilados y `agenda.db*` ya están en `.gitignore`; `app/api/notify/` vacía se resuelve con el scheduler).

## Constraints
- Next 16 breaking changes: respetar `connection()` en accesos a DB como hace el resto de `lib/data/`.
- Formato fecha aniversarios: `MM-DD` (ver `lib/data/anniversaries.ts:nextOccurrence`).
- No agregar dependencias (`node-cron`, `zod`, `ics` no hacen falta para esto).
- No romper `/api/calendar` (compat con clientes existentes).

## Tasks
- [x] T1 (`ical-lib`): extender `lib/ical.ts` — `anniversariesToICal`, `tasksToICal`, builder combinado. Acceptance: VEVENT con `RRULE:FREQ=YEARLY` para aniversarios; VTODO con `DUE`/`STATUS` para tareas; `eventsToICal` intacto.
- [x] T2 (`export-route`): crear `app/api/export/ics/route.ts` — global + `?type=`. Acceptance: `text/calendar`, `Content-Disposition` con nombre por tipo, tipo inválido → 400.
- [x] T3 (`verify-commit`): typecheck + lint + build en verde; commit PENDIENTE — el hook `Gentleman Guardian Angel` del repo exige Claude CLI (no instalado) y rechazó el commit. Cambios staged, listos para commitear. Desbloqueo: instalar Claude CLI, o autorización explícita para `--no-verify`.

## Authorized scope
Implementación autorizada por el usuario ("Ponte con la parte que está inacabada"). Archivos tocables: `lib/ical.ts`, `app/api/export/ics/route.ts`, este documento + su mirror en Engram. Nada fuera de eso sin nueva autorización.

## TDD
- Resolved mode: OFF. Source: `package.json` no define runner de tests ni framework (sin `test` script, sin vitest/jest). Tests presentes: no.
- Checks aplicables: `npm run typecheck`, `npm run lint` (ordinarios, no TDD).

## Delivery
- Forecast: ~100 líneas autoradas (muy por debajo del budget de 400). Strategy: `ask-on-risk` (default); no requiere split ni chain. Si a futuro el feature supera 400, aplicar vocabulario SDD antes del siguiente commit.

## Route declaration
- Por tarea: T1 inline, T2 inline, T3 inline.
- Trigger evidence: writer trigger (2 archivos no-triviales: `lib/ical.ts` + nueva ruta) pedía writer delegado, y mapping trigger (4+ archivos) pedía exploración delegada; ambos intentos de delegación fallaron porque el runtime actual rechaza subagentes ("free tier can only be used from within OpenCode"). Ruta inline declarada como fallback observable, en lotes chicos.

## Progress
- T1 done: `lib/ical.ts` suma `anniversariesToICal` (VEVENT + `RRULE:FREQ=YEARLY`, `DTSTART;VALUE=DATE`, UID `anniversary-{id}`), `tasksToICal` (VTODO con `DUE`/`STATUS`/`CATEGORIES`, UID `task-{id}`) y `agendaToICal` combinado. `eventsToICal`/`/api/calendar` con output idéntico (mismo header, refactor interno a `wrapCalendar`). Parser de fechas acepta ISO completo y `MM-DD`; inválidas se saltean.
- T2 done: `app/api/export/ics/route.ts` — global + `?type=events|anniversaries|tasks`, filenames por tipo, `type` inválido → 400. Ruta visible en `next build` como `ƒ /api/export/ics`.
- T3 partial: typecheck + lint + build en verde (ver evidencia). Commit NO creado: hook `Gentleman Guardian Angel v2.10.1` abortó (`Claude CLI not found`). Staged y verificado: `lib/ical.ts` (M), `app/api/export/ics/route.ts` (A), `odd/tasks/export-ics.md` (A). 305 insertions + 21 deletions. No se usó `--no-verify` (prohibido sin autorización explícita).

## Verification evidence
- `npm run typecheck` → pass (sin output, exit 0).
- `npm run lint` → pass (sin output, exit 0).
- Smoke node sobre `lib/ical.ts` transpilado: VEVENT 3 + VTODO 2 + `RRULE:FREQ=YEARLY` presente; aniversario inválido salteado; Feb-29 anclado a 2000 bisiesto.
- `npm run build` → Compiled successfully, TypeScript OK, `ƒ /api/export/ics` en el route table.

## Follow-ups (no scope de este feature)
- Bug preexistente: `lib/data/anniversaries.ts:nextOccurrence` y `lib/data/reminders.ts:anniversaryDueAt` parsean `date` como `MM-DD`, pero `app/actions/anniversaries.ts:dateToIso` guarda ISO completo → cumpleaños próximos y reminders de aniversario nunca matchean. Requiere su propio task + verificación (cambia comportamiento de Cumpleaños y notificaciones).
- Scheduler (`scripts/notify.ts`, `app/api/notify/` vacía), pulido (`error.tsx`/zod), limpieza `app/api/notify/` vacía.

## Next step
- Probar el `.ics` descargado importándolo en un cliente de calendario (Thunderbird/Google Calendar) y decidir siguiente feature (scheduler vs fix de fechas de aniversario).
