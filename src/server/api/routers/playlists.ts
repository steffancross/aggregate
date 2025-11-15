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
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(
    async ({
      ctx,
      input,
    }): Promise<{
      playlistEntries: PlaylistTrack[];
      playlistName: string;
      playlistId: number;
    } | null> => {
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

      if (!dbPlaylist) return null;

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

      return {
        playlistEntries: flattenedPlaylist,
        playlistName: dbPlaylist.name,
        playlistId: dbPlaylist.id,
      };
    },
  ),
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
  deletePlaylist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      await ctx.db.playlist.delete({
        where: { id: input.id, userId: ctx.user.id },
      });

      return { success: true };
    }),
  updatePlaylist: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      await ctx.db.playlist.update({
        where: { id: input.id, userId: ctx.user.id },
        data: { name: input.name },
      });

      return { name: input.name };
    }),
  updateTrackPlaylists: protectedProcedure
    .input(z.object({ trackId: z.number(), playlistIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        const libraryTrack = await tx.libraryTrack.findUnique({
          where: { id: input.trackId, userId: ctx.user.id },
        });

        if (!libraryTrack) {
          throw new Error("Library track not found");
        }

        const currentlyInPlaylists = await tx.playlistEntry.findMany({
          where: { libraryTrackId: input.trackId },
        });

        const currentPlaylistIds = new Set(
          currentlyInPlaylists.map((entry) => entry.playlistId),
        );
        const newPlaylistIds = new Set(input.playlistIds);

        const playlistsToAddTo = Array.from(newPlaylistIds).filter(
          (id) => !currentPlaylistIds.has(id),
        );
        const playlistsToRemoveFrom = Array.from(currentPlaylistIds).filter(
          (id) => !newPlaylistIds.has(id),
        );

        // adding track to playlists
        for (const playlistId of playlistsToAddTo) {
          const playlist = await tx.playlist.findUnique({
            where: {
              id: playlistId,
              userId: ctx.user.id,
            },
          });

          if (!playlist) {
            throw new Error(`Playlist ${playlistId} not found`);
          }

          const maxPositionEntry = await tx.playlistEntry.findFirst({
            where: {
              playlistId: playlistId,
            },
            orderBy: {
              position: "desc",
            },
          });

          const newPosition = maxPositionEntry
            ? maxPositionEntry.position + 1
            : 0;

          await tx.playlistEntry.create({
            data: {
              playlistId: playlistId,
              libraryTrackId: libraryTrack.id,
              position: newPosition,
            },
          });
        }

        // remove track from playlists
        for (const playlistId of playlistsToRemoveFrom) {
          const playlistEntry = await tx.playlistEntry.findFirst({
            where: {
              playlistId: playlistId,
              libraryTrackId: libraryTrack.id,
            },
          });

          if (!playlistEntry) {
            throw new Error(
              `Playlist entry for playlist ${playlistId} not found`,
            );
          }

          const removedPosition = playlistEntry.position;

          await tx.playlistEntry.delete({
            where: {
              playlistId_libraryTrackId: {
                playlistId: playlistId,
                libraryTrackId: libraryTrack.id,
              },
            },
          });

          // all entries in this playlist with position > removed position and decrement by 1
          const entriesToShift = await tx.playlistEntry.findMany({
            where: {
              playlistId: playlistId,
              position: {
                gt: removedPosition,
              },
            },
          });

          for (const entry of entriesToShift) {
            await tx.playlistEntry.update({
              where: {
                playlistId_libraryTrackId: {
                  playlistId: entry.playlistId,
                  libraryTrackId: entry.libraryTrackId,
                },
              },
              data: {
                position: entry.position - 1,
              },
            });
          }
        }

        return { success: true };
      });
    }),
});
