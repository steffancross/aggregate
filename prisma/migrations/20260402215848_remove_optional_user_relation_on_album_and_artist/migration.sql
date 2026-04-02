/*
  Warnings:

  - Made the column `userId` on table `Album` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Artist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Album" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Artist" ALTER COLUMN "userId" SET NOT NULL;
