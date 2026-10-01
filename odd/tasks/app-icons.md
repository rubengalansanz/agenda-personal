# Feature: app-icons (icono en instaladores)

## Objective
Dar icono a los instaladores de escritorio para desbloquear el target MSI de Windows (error WiX LGHT0094: falta `AgendaPersonalIcon.exe`).

## Problem
El target `msi` exige icono y el repo no tenía ninguno (`public/` solo tiene SVGs). Además `.gitignore` excluía `/build` entero, bloqueando los recursos de electron-builder.

## Why
Sin icono no hay `.msi` y el job de Windows queda en rojo.

## Scope
- Origen: `~/Escritorio/icono.png` (1024x1024 RGBA, solo lectura, intacto).
- Generados con Pillow: `build/icon.ico` (7 tamaños), `build/icon.icns`, `build/icons/` (9 PNGs 16-512).
- `package.json`: `mac.icon`, `win.icon`, `linux.icon`.
- `.gitignore`: `/build` → `/build/*` + excepciones solo para los iconos (el directorio en sí excluido no admite negaciones).
- Verificación: config validada contra el esquema electron-builder; la CI del push es la verificación final (job Windows).

## Out of scope
- Diseño del icono (lo aportó el usuario), firma de código.

## Authorized scope
Autorizado por el usuario (aportó el PNG y pidió adaptarlo). Tocables: `build/*` (iconos), `package.json`, `.gitignore`, este documento. Original de Escritorio intacto.

## Verification evidence
- `file`: ICO con 7 tamaños, ICNS válido; config `CONFIG VALIDA` contra scheme.json de electron-builder 26.
- md5 del original anotado en el log de generación (no se modificó).

## Progress
- Commit work-unit en rama feature; merge+push; CI verifica (job build-windows).
