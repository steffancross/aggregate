import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type Album, type SongSource } from "@prisma/client";

export const tracksRouter = createTRPCRouter({
  addTrack: protectedProcedure
    .input(
      z.object({
        album: z.string().nullable(),
        artist: z
          .array(z.string().min(1, "Artist name cannot be empty"))
          .min(1, "At least one artist is required"),
        artworkUrl: z.string().nullable(),
        duration: z.number().nullable(),
        source: z.string(),
        sourceId: z.string(),
        sourceUrl: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return await ctx.db.$transaction(async (tx) => {
        // base track
        let track = await tx.track.findUnique({
          where: {
            source_sourceId: {
              source: input.source as SongSource,
              sourceId: input.sourceId,
            },
          },
        });

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!track) {
          track = await tx.track.create({
            data: {
              source: input.source as SongSource,
              sourceId: input.sourceId,
              sourceUrl: input.sourceUrl,
              artworkUrl: input.artworkUrl,
              duration: input.duration,
            },
          });
        }

        // artists
        const artistPromises = input.artist.map(async (artistName) => {
          let artist = await tx.artist.findFirst({
            where: {
              name: artistName,
            },
          });

          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          if (!artist) {
            artist = await tx.artist.create({
              data: {
                name: artistName,
              },
            });
          }

          return artist;
        });
        const artists = await Promise.all(artistPromises);

        // album
        let album: Album | null = null;
        if (input.album !== null && input.album !== "") {
          album = await tx.album.findFirst({
            where: {
              name: input.album,
            },
          });

          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          if (!album) {
            album = await tx.album.create({
              data: {
                name: input.album,
              },
            });
          }
        }

        // library track
        const libraryTrack = await tx.libraryTrack.create({
          data: {
            title: input.title,
            albumId: album?.id ?? null,
            trackId: track.id,
            userId,
          },
        });

        // connect artists
        await tx.libraryTrackArtist.createMany({
          data: artists.map((artist) => ({
            libraryTrackId: libraryTrack.id,
            artistId: artist.id,
          })),
        });

        return libraryTrack;
      });
    }),
  updateTrack: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        artist: z
          .array(z.string().min(1, "Artist name cannot be empty"))
          .min(1, "At least one artist is required"),
        album: z.string().nullable(),
        artworkUrl: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return await ctx.db.$transaction(async (tx) => {
        const track = await tx.libraryTrack.findUnique({
          where: {
            id: input.id,
            userId: userId,
          },
        });

        if (!track) {
          throw new Error("Track not found");
        }

        // artists
        const artistPromises = input.artist.map(async (artistName) => {
          let artist = await tx.artist.findFirst({
            where: {
              name: artistName,
            },
          });

          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          if (!artist) {
            artist = await tx.artist.create({
              data: {
                name: artistName,
              },
            });
          }

          return artist;
        });
        const artists = await Promise.all(artistPromises);

        // album
        let album: Album | null = null;
        if (input.album !== null && input.album !== "") {
          album = await tx.album.findFirst({
            where: {
              name: input.album,
            },
          });

          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          if (!album) {
            album = await tx.album.create({
              data: {
                name: input.album,
              },
            });
          }
        }

        const updatedTrack = await tx.libraryTrack.update({
          where: { id: input.id, userId: userId },
          data: {
            title: input.title,
            albumId: album?.id ?? null,
          },
        });

        // Delete existing artist relationships
        await tx.libraryTrackArtist.deleteMany({
          where: {
            libraryTrackId: input.id,
          },
        });

        await tx.libraryTrackArtist.createMany({
          data: artists.map((artist) => ({
            libraryTrackId: input.id,
            artistId: artist.id,
          })),
        });

        return updatedTrack;
      });
    }),
  getTrackPlaylists: protectedProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ ctx, input }) => {
      const libraryTrack = await ctx.db.libraryTrack.findUnique({
        where: {
          id: input.trackId,
          userId: ctx.user.id,
        },
      });

      if (!libraryTrack) {
        throw new Error("Library track not found");
      }

      const playlistEntries = await ctx.db.playlistEntry.findMany({
        where: {
          libraryTrackId: input.trackId,
        },
      });

      return playlistEntries.map((entry) => {
        return entry.playlistId;
      });
    }),
});
