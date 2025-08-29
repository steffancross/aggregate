import { z } from "zod";
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
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.playlist.findUnique({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          playlistEntries: {
            include: {
              libraryTrack: {
                include: {
                  artists: {
                    include: {
                      artist: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
});
