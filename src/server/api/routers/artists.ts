import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const artistsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const artists = await ctx.db.artist.findMany({
      where: {
        libraryTracks: {
          some: {
            libraryTrack: {
              userId: ctx.user.id,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return artists.map((artist) => ({
      value: artist.name,
      label: artist.name,
    }));
  }),
});
