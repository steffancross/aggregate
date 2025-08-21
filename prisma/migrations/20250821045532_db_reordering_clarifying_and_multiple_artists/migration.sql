/*
  Warnings:

  - You are about to drop the `PlaylistTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTrackMetadata` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PlaylistTrack" DROP CONSTRAINT "PlaylistTrack_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlaylistTrack" DROP CONSTRAINT "PlaylistTrack_trackId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTrackMetadata" DROP CONSTRAINT "UserTrackMetadata_albumId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTrackMetadata" DROP CONSTRAINT "UserTrackMetadata_artistId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTrackMetadata" DROP CONSTRAINT "UserTrackMetadata_trackId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserTrackMetadata" DROP CONSTRAINT "UserTrackMetadata_userId_fkey";

-- DropTable
DROP TABLE "public"."PlaylistTrack";

-- DropTable
DROP TABLE "public"."UserTrackMetadata";

-- CreateTable
CREATE TABLE "public"."PlaylistEntry" (
    "position" INTEGER NOT NULL,
    "playlistId" INTEGER NOT NULL,
    "libraryTrackId" INTEGER NOT NULL,

    CONSTRAINT "PlaylistEntry_pkey" PRIMARY KEY ("playlistId","libraryTrackId")
);

-- CreateTable
CREATE TABLE "public"."LibraryTrack" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "albumId" INTEGER,
    "trackId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "LibraryTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LibraryTrackArtist" (
    "libraryTrackId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,

    CONSTRAINT "LibraryTrackArtist_pkey" PRIMARY KEY ("libraryTrackId","artistId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistEntry_playlistId_position_key" ON "public"."PlaylistEntry"("playlistId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryTrack_trackId_userId_key" ON "public"."LibraryTrack"("trackId", "userId");

-- AddForeignKey
ALTER TABLE "public"."PlaylistEntry" ADD CONSTRAINT "PlaylistEntry_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlaylistEntry" ADD CONSTRAINT "PlaylistEntry_libraryTrackId_fkey" FOREIGN KEY ("libraryTrackId") REFERENCES "public"."LibraryTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryTrack" ADD CONSTRAINT "LibraryTrack_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "public"."Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryTrack" ADD CONSTRAINT "LibraryTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryTrack" ADD CONSTRAINT "LibraryTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryTrackArtist" ADD CONSTRAINT "LibraryTrackArtist_libraryTrackId_fkey" FOREIGN KEY ("libraryTrackId") REFERENCES "public"."LibraryTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LibraryTrackArtist" ADD CONSTRAINT "LibraryTrackArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
