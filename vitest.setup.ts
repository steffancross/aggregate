import { beforeEach, afterEach, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

const testDb: PrismaClient = prisma;

beforeEach(async () => {
  await prisma.$executeRawUnsafe("BEGIN;");
});

afterEach(async () => {
  await prisma.$executeRawUnsafe("ROLLBACK;");
});

afterAll(async () => {
  await prisma.$disconnect();
});

// https://vitest.dev/guide/mocking.html
// mock hoisting
vi.mock("~/server/db", () => ({
  db: testDb,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "test-user-id" }),
}));

beforeEach(async () => {
  const { auth } = await import("@clerk/nextjs/server");
  vi.mocked(auth).mockResolvedValue({
    userId: "test-user-id",
  } as unknown as never);
});

export { testDb as db };
