import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required to prepare the test database");
if (!/test/i.test(databaseUrl)) {
  throw new Error("Refusing to reset a database URL that does not contain 'test'");
}

execSync("npx prisma migrate reset --force --skip-seed", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: "test" },
});
