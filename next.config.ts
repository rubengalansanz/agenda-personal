import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "web-push"],
  output: "standalone",
};

export default nextConfig;
