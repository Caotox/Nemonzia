import { db } from "./server/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runMigration() {
  try {
    console.log("Running migration...");
    
    const migrationPath = path.join(process.cwd(), "migrations", "0001_add_scrim_games_and_compositions.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));
    
    for (const statement of statements) {
      await db.execute(sql.raw(statement));
      console.log("Executed:", statement.substring(0, 50) + "...");
    }
    
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
