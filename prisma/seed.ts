import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: [],
});

const seed = async () => {
  const existingUser = await db.user.findUnique({
    where: {
      clerkId: process.env.CLERK_ID!,
    },
  });

  if (existingUser) {
    console.log("user already exists");
    return;
  }

  await db.user.create({
    data: {
      clerkId: process.env.CLERK_ID!,
    },
  });

  console.log("user created");
};

seed()
  .then(async () => {
    console.log("seeding complete");
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
