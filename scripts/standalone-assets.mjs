import { cpSync, existsSync } from "node:fs";
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