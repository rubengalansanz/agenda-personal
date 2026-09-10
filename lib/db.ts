import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  db?: BetterSQLite3Database<typeof schema>;
};

function migrationsFolder(): string {
  return process.env.MIGRATIONS_DIR ?? join(process.cwd(), "db/migrations");
}

function ensureSchema(
  sqlite: InstanceType<typeof Database>,
  drizzleDb: BetterSQLite3Database<typeof schema>,
) {
  const userTables = sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite\\_%' ESCAPE '\\'",
    )
    .all() as { name: string }[];

  const hasJournal = sqlite
    .prepare(
      "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'",
    )
    .get();

  if (userTables.length > 0 && !hasJournal) {
    const journal = JSON.parse(
      readFileSync(join(migrationsFolder(), "meta/_journal.json"), "utf8"),
    ) as { entries: { when: number }[] };
    const maxWhen = Math.max(...journal.entries.map((e) => e.when), 0);
    sqlite.exec(
      `CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (` +
        `"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, ` +
        `"hash" text NOT NULL, ` +
        `"created_at" numeric)`,
    );
    sqlite
      .prepare(
        `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)`,
      )
      .run("legacy", maxWhen);
    return;
  }

  migrate(drizzleDb, { migrationsFolder: migrationsFolder() });
}

function createDb() {
  const sqlite = new Database(process.env.DB_FILE ?? "agenda.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const drizzleDb = drizzle(sqlite, { schema });
  ensureSchema(sqlite, drizzleDb);
  return drizzleDb;
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
