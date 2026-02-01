#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
try {
  const envPath = join(__dirname, "..", ".env.local");
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {
  console.warn("Could not load .env.local, using process.env");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

// Split SQL into statements, respecting $$...$$ blocks
function splitStatements(sql) {
  const statements = [];
  let current = "";
  let i = 0;
  const len = sql.length;

  while (i < len) {
    if (sql.substring(i, i + 2) === "$$") {
      current += "$$";
      i += 2;
      while (i < len && sql.substring(i, i + 2) !== "$$") {
        current += sql[i++];
      }
      if (i < len) {
        current += "$$";
        i += 2;
      }
      continue;
    }
    if (sql[i] === ";") {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith("--")) {
        statements.push(stmt + ";");
      }
      current = "";
      i++;
      continue;
    }
    current += sql[i++];
  }
  const stmt = current.trim();
  if (stmt && !stmt.startsWith("--")) {
    statements.push(stmt + (stmt.endsWith(";") ? "" : ";"));
  }
  return statements;
}

const sql = neon(databaseUrl);
const migrationsDir = join(__dirname, "..", "neon", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

async function run() {
  try {
    console.log("Connected to Neon database\n");

    for (const file of files) {
      const path = join(migrationsDir, file);
      const content = readFileSync(path, "utf8");
      const statements = splitStatements(content).filter((s) => s.trim().length > 1);

      console.log(`Running ${file} (${statements.length} statements)...`);

      for (const statement of statements) {
        await sql.unsafe(statement);
      }
      console.log(`  ✓ ${file} done\n`);
    }

    console.log("All migrations completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

run();
