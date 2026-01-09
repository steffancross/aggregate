import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  log: [],
});

const createUser = async () => {
  const clerkId = process.argv[2];

  if (!clerkId) {
    console.error("Clerk ID is required");
    process.exit(1);
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) {
      console.log(
        `User with Clerk ID "${clerkId}" already exists (ID: ${existingUser.id})`,
      );
      await db.$disconnect();
      return;
    }

    await db.user.create({
      data: {
        clerkId,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
};

createUser()
  .then(() => {
    console.log("User created successfully");
  })
  .catch((error) => {
    console.error("Error creating user:", error);
    process.exit(1);
  });
