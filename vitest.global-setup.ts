import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("npx prisma migrate reset --force", {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
    stdio: "ignore",
  });
}
