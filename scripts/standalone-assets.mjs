import {
  cpSync,
  existsSync,
  lstatSync,
  readdirSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  process.exit(0);
}

const publicSrc = join(root, "public");
if (existsSync(publicSrc)) {
  cpSync(publicSrc, join(standalone, "public"), { recursive: true });
}

const staticSrc = join(root, ".next", "static");
if (existsSync(staticSrc)) {
  cpSync(staticSrc, join(standalone, ".next", "static"), { recursive: true });
}

// Next's file tracing leaves hashed symlinks (e.g. `better-sqlite3-<hash>`)
// under `.next/standalone/.next/node_modules/` pointing at the real dirs in
// `.next/standalone/node_modules/`. Turbopack-compiled chunks require those
// HASHED names literally, so the links (or equivalent real dirs) MUST stay —
// but WiX (Windows MSI) chokes on symlinks. Materialize them as real copies.
const tracedModules = join(standalone, ".next", "node_modules");
if (existsSync(tracedModules)) {
  for (const entry of readdirSync(tracedModules)) {
    if (!/-[0-9a-f]{16}$/.test(entry)) continue;
    const full = join(tracedModules, entry);
    let stat;
    try {
      stat = lstatSync(full);
    } catch {
      continue;
    }
    if (!stat.isSymbolicLink()) continue;
    let target;
    try {
      target = realpathSync(full);
    } catch {
      console.warn(`standalone-assets: dangling link, removing ${entry}`);
      rmSync(full);
      continue;
    }
    const inside =
      relative(resolve(standalone), target) &&
      !relative(resolve(standalone), target).startsWith("..");
    if (!inside) {
      console.warn(`standalone-assets: link escapes standalone, keeping ${entry}`);
      continue;
    }
    rmSync(full);
    cpSync(target, full, { recursive: true });
    console.log(`standalone-assets: materialized traced link ${entry}`);
  }
}