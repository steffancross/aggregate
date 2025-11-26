import { execSync } from "node:child_process";
import dotenv from "dotenv";

export default async function globalSetup() {
  // seems like for global setup files, vitest doesn't load env
  // but works fine for normal setup files
  dotenv.config({ path: ".env" });

  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL environment variable is not set. Please set it in your .env file.",
    );
  }

  execSync("npx prisma migrate reset --force", {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
    stdio: "ignore",
  });
}
