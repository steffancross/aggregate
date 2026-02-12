import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

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
  getUserArtists: protectedProcedure.query(async ({ ctx }) => {
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
      id: artist.id,
      name: artist.name,
    }));
  }),
  getArtistSongs: protectedProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ ctx, input }) => {
      const artist = await ctx.db.artist.findUnique({
        where: { id: input.artistId },
      });
      if (!artist) return null;

      const libraryTracks = await ctx.db.libraryTrack.findMany({
        where: {
          userId: ctx.user.id,
          artists: {
            some: {
              artistId: input.artistId,
            },
          },
        },
        include: {
          track: true,
          artists: {
            include: {
              artist: true,
            },
          },
          album: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const tracks = libraryTracks.map((track) => ({
        id: track.id,
        title: track.title,
        artists: track.artists.map((a) => ({
          artistId: a.artistId,
          artistName: a.artist.name,
        })),
        album: track.album?.name ?? null,
        duration: track.track.duration,
        source: track.track.source,
        sourceId: track.track.sourceId,
        sourceUrl: track.track.sourceUrl,
        artworkUrl: track.track.artworkUrl,
        trackId: track.id,
        playlistId: -1,
        playlistName: "",
        position: 1,
        albumId: track.album?.id ?? null,
        isPlayable: track.track.isPlayable,
        // TODO: remove, jus tto make the table happy for now
        isInAnyPlaylist: true,
      }));

      return {
        artistName: artist.name,
        tracks,
      };
    }),
});
