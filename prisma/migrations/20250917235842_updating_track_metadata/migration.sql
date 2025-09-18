/*
  Warnings:

  - You are about to drop the column `sourceIdentifier` on the `Track` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[source,sourceId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Track_source_sourceIdentifier_key";

-- AlterTable
ALTER TABLE "public"."Track" DROP COLUMN "sourceIdentifier",
ADD COLUMN     "artworkUrl" TEXT,
ADD COLUMN     "isPlayable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Track_source_sourceId_key" ON "public"."Track"("source", "sourceId");
