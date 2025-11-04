import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PlaylistTrack } from "~/app/_components/player/types/player";

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
    .query(async ({ ctx, input }): Promise<PlaylistTrack[] | []> => {
      const dbPlaylist = await ctx.db.playlist.findUnique({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          playlistEntries: {
            include: {
              libraryTrack: {
                include: {
                  track: true,
                  album: true,
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

      if (!dbPlaylist) return [];

      const flattenedPlaylist = dbPlaylist.playlistEntries
        .map((entry) => {
          return {
            playlistId: entry.playlistId,
            playlistName: dbPlaylist.name,
            trackId: entry.libraryTrackId,
            position: entry.position,
            album: entry.libraryTrack.album?.name ?? null,
            albumId: entry.libraryTrack.albumId,
            artists: entry.libraryTrack.artists.map((artist) => {
              return {
                artistId: artist.artistId,
                artistName: artist.artist.name,
              };
            }),
            title: entry.libraryTrack.title,
            source: entry.libraryTrack.track.source,
            sourceId: entry.libraryTrack.track.sourceId,
            sourceUrl: entry.libraryTrack.track.sourceUrl,
            artworkUrl: entry.libraryTrack.track.artworkUrl,
            duration: entry.libraryTrack.track.duration,
          };
        })
        .sort((a, b) => a.position - b.position);

      return flattenedPlaylist;
    }),

  addPlaylist: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let playlist = await ctx.db.playlist.findFirst({
        where: { name: input.name, userId: ctx.user.id },
      });

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (!playlist) {
        playlist = await ctx.db.playlist.create({
          data: { name: input.name, userId: ctx.user.id },
        });
      }

      return playlist;
    }),
});
