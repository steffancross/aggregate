import { postRouter } from "~/server/api/routers/post";
import { playlistsRouter } from "~/server/api/routers/playlists";
import { userRouter } from "~/server/api/routers/user";
import { libraryRouter } from "~/server/api/routers/library";
import { artistsRouter } from "~/server/api/routers/artists";
import { tracksRouter } from "~/server/api/routers/tracks";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  playlists: playlistsRouter,
  user: userRouter,
  library: libraryRouter,
  artists: artistsRouter,
  tracks: tracksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
