# Feature: anniversary-dates (fix formato fecha aniversarios)

## Objective
Arreglar que cumpleaños/aniversarios guardados en ISO completo nunca aparecen como próximos ni disparan recordatorios.

## Problem
- Escritura (`app/actions/anniversaries.ts` + `lib/datetime.ts:dateToIso`) guarda ISO completo (`1990-05-14T00:00:00.000Z`).
- Lectura (`lib/data/anniversaries.ts:nextOccurrence` y `lib/data/reminders.ts:anniversaryDueAt`) parsea con `split("-")` asumiendo `MM-DD` pelado.
- Resultado: `nextOccurrence` devuelve `null` (página `/cumpleanos` vacía) y `anniversaryDueAt` calcula fecha basura (reminders nunca disparan).
- `lib/ical.ts` ya acepta ambos formatos, por eso el export funciona.

## Why
Bug funcional: la sección Cumpleaños y sus recordatorios están rotos con datos reales.

## Scope
- Nuevo helper compartido `lib/anniversary-date.ts`: `parseMonthDay()` (ISO completo + `MM-DD`, valida mes/día real incl. 29-feb) + `isValidDate()`.
- `lib/data/anniversaries.ts`: usar helper en `nextOccurrence()`.
- `lib/data/reminders.ts`: usar helper en `anniversaryDueAt()`.
- Escritura ISO intacta (no se pierde año de nacimiento, no se rompe export).

## Out of scope
- Scheduler (`scripts/notify.ts`), pulido (`error.tsx`/zod), migración de datos.

## Constraints
- Next 16: respetar `connection()` donde ya existe (no se toca).
- No romper `lib/ical.ts` ni `/api/export/ics` (ya tolerante).
- Fechas inválidas se saltean (`null`), no se inventan.

## Tasks
- [ ] T1 (`date-helper`): crear `lib/anniversary-date.ts` con `parseMonthDay` + `isValidDate`. Acceptance: ISO y `MM-DD` válidos → `{month, day}`; inválidos → `null`; 29-feb válido.
- [ ] T2 (`readers`): usar helper en `nextOccurrence` y `anniversaryDueAt`. Acceptance: aniversario ISO aparece con `nextDate` correcto; legacy `MM-DD` sigue funcionando; inválidos se saltean.
- [ ] T3 (`verify-commit`): typecheck + lint + build en verde; commit work-unit en rama feature.

## Authorized scope
Implementación autorizada por el usuario ("Ponte con lo que haya que realizar"). Archivos tocables: `lib/anniversary-date.ts` (nuevo), `lib/data/anniversaries.ts`, `lib/data/reminders.ts`, este documento + mirror en Engram. Nada fuera de eso sin nueva autorización.

## TDD
- Resolved mode: OFF. Source: `package.json` sin runner de tests (sin script `test`, sin vitest/jest).
- Checks aplicables: `npm run typecheck`, `npm run lint`, `npm run build` (ordinarios, no TDD).

## Delivery
- Forecast: ~60 líneas autoradas (muy por debajo del budget de 400). Strategy: `ask-on-risk` (default); no requiere split ni chain.

## Route declaration
- Por tarea: T1 inline, T2 inline, T3 inline.
- Trigger evidence: writer trigger (2 archivos no-triviales + 1 nuevo) pediría writer delegado, pero el runtime actual rechaza subagentes ("free tier can only be used from within OpenCode", ver `odd/tasks/export-ics.md`). Ruta inline declarada como fallback observable, en lotes chicos.

## Progress
- T1 done: `lib/anniversary-date.ts` creado con `parseMonthDay` (ISO completo + `MM-DD`, inválidos → `null`) e `isValidDate`.
- T2 done: `lib/data/anniversaries.ts:nextOccurrence` y `lib/data/reminders.ts:anniversaryDueAt` usan el helper; escritura ISO intacta. Fechas imposibles (p. ej. 30-feb por año no bisiesto) se saltean.
- T3 done: typecheck + lint + build en verde (ver evidencia). Mirror Engram pendiente (servidor Engram no confirmó registro de sesión; reintentar en próxima sesión).

## Verification evidence
- `npm run typecheck` → pass (exit 0, sin output).
- `npm run lint` → pass (exit 0, sin output).
- Smoke node sobre `lib/anniversary-date.ts` real: ISO `"1990-05-14T00:00:00.000Z"` → `{5,14}`; `"05-14"` → `{5,14}`; `"2024-02-29..."` → `{2,29}`; `"1990-13-40"` → `null`; `""` → `null`.
- `npm run build` → Compiled successfully, TypeScript OK en 52s, 11 rutas (incl. `ƒ /cumpleanos` y `ƒ /api/export/ics`) + postbuild OK.
