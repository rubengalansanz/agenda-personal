import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as {
  db?: BetterSQLite3Database<typeof schema>;
};

function createDb() {
  const sqlite = new Database(process.env.DB_FILE ?? "agenda.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
