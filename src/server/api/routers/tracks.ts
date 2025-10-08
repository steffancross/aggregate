import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type SongSource } from "@prisma/client";

export const tracksRouter = createTRPCRouter({
  addTrack: protectedProcedure
    .input(
      z.object({
        album: z.string().optional(),
        artist: z
          .array(z.string().min(1, "Artist name cannot be empty"))
          .min(1, "At least one artist is required"),
        artworkUrl: z.string().optional(),
        duration: z.number().optional(),
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
        let album = await tx.album.findFirst({
          where: {
            name: input.album,
          },
        });

        if (!album && input.album) {
          album = await tx.album.create({
            data: {
              name: input.album,
            },
          });
        }

        // library track
        const libraryTrack = await tx.libraryTrack.create({
          data: {
            title: input.title,
            albumId: album?.id ?? undefined,
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
});
