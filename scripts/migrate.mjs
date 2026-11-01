import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Pull it from the linked Vercel project or the Neon dashboard, then run this again.");
  process.exit(1);
}

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(";")
  .map((statement) => statement.replace(/--.*$/gm, "").trim())
  .filter(Boolean);

const sql = neon(url);
for (const statement of statements) {
  await sql.query(statement);
  console.log(`Applied: ${statement.split("\n")[0]}`);
}
console.log("Inquiry tables are ready.");
