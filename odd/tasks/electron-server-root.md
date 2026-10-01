# Feature: electron-server-root (fix spawn ENOTDIR en app instalada)

## Objective
Arreglar el arranque de la app instalada: `Failed to start application: Error: spawn ENOTDIR` en `startNextServer`.

## Problem
`getProjectRoot()` = `path.join(__dirname, "..")`. Empaquetado, `__dirname` es `.../resources/app.asar/electron`, así que devolvía `.../app.asar` (el FICHERO asar). `spawn` con `cwd` = fichero → ENOTDIR. Además el servidor desempaquetado vive en `app.asar.unpacked` (por `asarUnpack`), no dentro del asar.

## Why
La app instalada no arrancaba en ningún SO (mismo código en los 3 instaladores).

## Scope
- `electron/main.ts`: nuevo `getServerDir()` (dev → raíz del proyecto; empaquetado → `resourcesPath/app.asar.unpacked`) + ruta absoluta a `.next/standalone/server.js` en el spawn.
- Verificación: `electron:build:ts` local OK; CI empaqueta; el usuario prueba el instalador.

## Out of scope
- `MIGRATIONS_DIR` en dev (preexistente, sin efecto: en dev el server lo lanza concurrently, no Electron).
- Nueva release (siguiente paso: tag v0.1.1 tras CI verde).

## Verification evidence
- Demo node: `path.join('.../app.asar/electron','..')` → `.../app.asar` (fichero) = ENOTDIR. Probado.
- `npm run electron:build:ts` → exit 0; solo `M electron/main.ts` (.js ignorados).
