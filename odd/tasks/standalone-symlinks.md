# Feature: standalone-symlinks (fix MSI Windows LGHT0103)

## Objective
Arreglar el job build-windows: WiX light fallaba con LGHT0103 al no encontrar `better-sqlite3-<hash>` dentro de `asar.unpacked`.

## Problem
El trazador de Next deja symlinks hasheados (`better-sqlite3-<hash>`, `web-push-<hash>`) en `.next/standalone/.next/node_modules/` apuntando a los dirs reales de `.next/standalone/node_modules/`. El asar los tolera (Linux/macOS en verde), WiX no.

## Why
Sin esto no hay `.msi` y el job Windows queda rojo.

## Scope
- `scripts/standalone-assets.mjs`: MATERIALIZA los symlinks hasheados como copias reales (no borrar: los chunks de Turbopack hacen require del nombre hasheado literal; borrarlos rompió el runtime con `Cannot find module better-sqlite3-<hash>` — error mío, verificado con el specifier equivocado).
- Solo symlinks `*-<16 hex>` cuyo target quede dentro de standalone; dangling → se eliminan; escapes → se conservan con warning.
- Verificación: build local + `createRequire` del specifier hasheado desde ruta anidada (resuelve Y carga el nativo) + 0 symlinks en standalone + CI Windows del push.

## Out of scope
- Resto de targets (verdes), firma de código.

## Authorized scope
Autorizado ("Impleméntalo, por favor"). Tocables: `scripts/standalone-assets.mjs`, este documento.

## Verification evidence
- Build local: postbuild `materialized traced link` ×2; dirs reales (no symlinks); 0 symlinks en `.next/standalone`.
- `createRequire` desde `.next/standalone/.next/server/app/page.js` con los specifiers HASHEADOS: resuelven Y el nativo carga.
- Corrección honesta: el primer enfoque (borrar) verificó `require('better-sqlite3')` en vez del hasheado — verificación inválida que rompió el runtime instalado. Este fix lo corrige materializando.
- CI (job build-windows del push) como verificación final.
