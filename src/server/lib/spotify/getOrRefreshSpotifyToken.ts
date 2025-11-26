import { db } from "~/server/db";
import { refreshSpotifyToken } from "./refreshSpotifyToken";

export const getOrRefreshSpotifyToken = async ({
  clerkId,
}: {
  clerkId: string;
}): Promise<string> => {
  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (
    !user.spotifyAccessToken ||
    !user.spotifyTokenExpiresAt ||
    !user.spotifyRefreshToken
  ) {
    throw new Error("User is missing Spotify credentials, reauthorize");
  }

  if (user.spotifyTokenExpiresAt < new Date()) {
    return await refreshSpotifyToken({ user });
  }

  return user.spotifyAccessToken;
};
