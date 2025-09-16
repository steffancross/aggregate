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
            id: artist.artistId,
            name: artist.artist.name,
          };
        }),
        album: track.album,
        duration: track.track.duration,
        source: track.track.source,
        sourceIdentifier: track.track.sourceIdentifier,
      };
    });

    return flattenedLibrary;
  }),
});
