# Feature: standalone-symlinks (fix MSI Windows LGHT0103)

## Objective
Arreglar el job build-windows: WiX light fallaba con LGHT0103 al no encontrar `better-sqlite3-<hash>` dentro de `asar.unpacked`.

## Problem
El trazador de Next deja symlinks hasheados (`better-sqlite3-<hash>`, `web-push-<hash>`) en `.next/standalone/.next/node_modules/` apuntando a los dirs reales de `.next/standalone/node_modules/`. El asar los tolera (Linux/macOS en verde), WiX no.

## Why
Sin esto no hay `.msi` y el job Windows queda rojo.

## Scope
- `scripts/standalone-assets.mjs`: elimina symlinks `*-<16 hex>` bajo `.next/standalone/.next/node_modules/` en el postbuild (ya corría ahí).
- Seguro en runtime: verificado que Node resuelve ambos módulos a los dirs reales por walk-up.
- Verificación: build local + resolución Node + CI Windows del push.

## Out of scope
- Resto de targets (verdes), firma de código.

## Authorized scope
Autorizado ("Impleméntalo, por favor"). Tocables: `scripts/standalone-assets.mjs`, este documento.

## Verification evidence
- Build local: postbuild log `removed redundant traced link` ×2; dir anidado queda con 0 entradas.
- `createRequire` desde `.next/standalone/.next/server/app/page.js` resuelve better-sqlite3 y web-push a los dirs reales.
- CI (job build-windows) como verificación final.
