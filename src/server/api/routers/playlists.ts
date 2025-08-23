import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const playlistsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.playlist.findMany({
      include: {
        playlistEntries: true,
      },
    });
  }),
});
