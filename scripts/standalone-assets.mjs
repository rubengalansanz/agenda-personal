import { cpSync, existsSync, lstatSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
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
// `.next/standalone/node_modules/`. Node resolves those real dirs by walking
// up anyway, but WiX (Windows MSI) chokes on the links. Remove them.
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
    if (stat.isSymbolicLink()) {
      rmSync(full);
      console.log(`standalone-assets: removed redundant traced link ${entry}`);
    }
  }
}