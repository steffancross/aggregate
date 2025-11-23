import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  userConnectedToSpotify: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user.spotifyAccessToken !== null;
  }),
});
