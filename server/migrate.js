// migrate.js
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in server/.env");
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({ connectionString });

  try {
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Connected");

    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("⚠️ No .sql files found in migrations/");
      return;
    }

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`\n📄 Running migration: ${file}`);
      await client.query(sql);
      console.log(`✅ Done: ${file}`);
    }

    console.log("\n🎉 All migrations ran successfully!");
  } catch (err) {
    console.error("❌ Error running migrations:", err.message);
  } finally {
    await client.end();
    console.log("🔌 Disconnected from database");
  }
}

runMigrations();
