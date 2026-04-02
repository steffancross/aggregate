/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Album_name_userId_key" ON "Album"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_userId_key" ON "Artist"("name", "userId");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
