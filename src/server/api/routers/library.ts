import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const libraryRouter = createTRPCRouter({
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
        album: track.album,
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
      };
    });

    return flattenedLibrary;
  }),
});
