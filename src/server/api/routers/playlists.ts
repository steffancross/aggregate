import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const playlistsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.playlist.findMany({
      where: {
        userId: ctx.user.id,
      },
      include: {
        playlistEntries: true,
      },
    });
  }),
});
