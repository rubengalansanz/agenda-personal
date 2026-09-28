# Feature: ci-packaging-fixes (CI en verde)

## Objective
Poner en verde los 3 jobs de `Build Desktop`, rojos desde que se creó el workflow.

## Problem (3 causas confirmadas en logs del run 36486784975)
1. `electron/main.js` ausente en CI: los `.js` compilados de `electron/` están en `.gitignore` (correcto) pero el workflow nunca corre `electron:build:ts` → el asar sale sin entry point (`Application entry file ... was not found`).
2. `SQLITE_BUSY database is locked` (macOS, pragma WAL) y `DrizzleError CREATE TABLE anniversaries` (Windows, migrate): en CI la DB no existe y cada worker del build crea+migra la misma `agenda.db` a la vez. En local no pasa porque la DB ya está migrada.
3. (Ya resuelto antes) `configuration.rpm` inválido — el log nuevo llega hasta empaquetar, superado.

## Why
Sin CI en verde no hay ejecutables para ningún SO.

## Scope
- `.github/workflows/release.yml`: paso `Build Electron main` (`npm run electron:build:ts`) tras el Build en los 3 jobs; `DB_FILE: ":memory:"` en los pasos de Build (cada worker migra su propia DB en memoria, cero contención y cero suciedad en el repo).
- `lib/db.ts`: `busy_timeout = 5000` antes de `journal_mode` (defensa en general; también protege dev+build simultáneos en local).
- Verificación: typecheck + lint + validación YAML; la propia CI (disparada por el push) es la verificación final.

## Out of scope
- Firma de código, cambios de targets, tests.

## Constraints
- No cambiar comportamiento de la app: `:memory:` solo en CI; `busy_timeout` no altera semántica, solo espera ante lock.
- No trackear `agenda.db*` ni `electron/*.js` (siguen ignorados).

## Tasks
- [ ] T1 (`workflow`): pasos en release.yml. Acceptance: YAML válido; jobs llegan a Package.
- [ ] T2 (`db`): busy_timeout en createDb. Acceptance: typecheck+lint en verde.
- [ ] T3 (`verify-commit`): commit + push; CI del propio push como evidencia final.

## Authorized scope
Autorizado por el usuario ("Hazlo, por favor"). Tocables: `.github/workflows/release.yml`, `lib/db.ts`, este documento + mirror Engram. Nada más sin nueva autorización.

## TDD
- Resolved mode: OFF (sin runner de tests en package.json). Checks: typecheck, lint, CI.

## Delivery
- Forecast: ~15 líneas. Strategy: ask-on-risk (default).

## Route declaration
- Todo inline (2 archivos conocidos, cambio acotado); sin delegación.

## Progress
- (evidencia + commit)

## Verification evidence
- (comandos + resultado observado)
