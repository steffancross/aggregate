import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const libraryRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string().max(100) }))
    .query(async ({ ctx, input }) => {
      const trimmed = input.query.trim();
      if (!trimmed) {
        return { artists: [] as { id: number; name: string }[], songs: [] };
      }

      const artistWhere = {
        userId: ctx.user.id,
        name: { contains: trimmed, mode: "insensitive" as const },
        libraryTracks: {
          some: {
            libraryTrack: {
              userId: ctx.user.id,
            },
          },
        },
      };

      const [artists, libraryTracks] = await Promise.all([
        ctx.db.artist.findMany({
          where: artistWhere,
          take: 3,
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
        ctx.db.libraryTrack.findMany({
          where: {
            userId: ctx.user.id,
            title: { contains: trimmed, mode: "insensitive" },
          },
          take: 5,
          orderBy: { title: "asc" },
          include: {
            track: true,
            artists: {
              include: {
                artist: true,
              },
            },
            album: true,
            playlistEntries: true,
          },
        }),
      ]);

      const songs = libraryTracks.map((track) => ({
        id: track.id,
        title: track.title,
        artists: track.artists.map((artist) => ({
          artistId: artist.artistId,
          artistName: artist.artist.name,
        })),
        album: track.album?.name ?? null,
        duration: track.track.duration,
        source: track.track.source,
        sourceId: track.track.sourceId,
        sourceUrl: track.track.sourceUrl,
        artworkUrl: track.track.artworkUrl,
        trackId: track.id,
        playlistId: -1,
        playlistName: "",
        position: 1,
        albumId: track.album?.id ?? null,
        isPlayable: track.track.isPlayable,
        isInAnyPlaylist: track.playlistEntries.length > 0,
      }));

      return { artists, songs };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const libraryTracks = await ctx.db.libraryTrack.findMany({
      where: {
        userId: ctx.user.id,
      },
      include: {
        track: true,
        artists: {
          include: {
            artist: true,
          },
        },
        album: true,
        playlistEntries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const flattenedLibrary = libraryTracks.map((track) => {
      return {
        id: track.id,
        title: track.title,
        artists: track.artists.map((artist) => {
          return {
            artistId: artist.artistId,
            artistName: artist.artist.name,
          };
        }),
        album: track.album?.name ?? null,
        duration: track.track.duration,
        source: track.track.source,
        sourceId: track.track.sourceId,
        sourceUrl: track.track.sourceUrl,
        artworkUrl: track.track.artworkUrl,

        // additional fields to satisfy playlistTrack type
        trackId: track.id,
        playlistId: -1,
        playlistName: "",
        position: 1,
        albumId: track.album?.id ?? null,
        isPlayable: track.track.isPlayable,
        isInAnyPlaylist: track.playlistEntries.length > 0,
      };
    });

    return flattenedLibrary;
  }),
});
