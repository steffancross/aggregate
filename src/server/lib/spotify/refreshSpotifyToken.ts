// https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
import type { User } from "@prisma/client";
import { db } from "~/server/db";

export const refreshSpotifyToken = async ({
  user,
}: {
  user: User;
}): Promise<string> => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_SECRET_KEY;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify client ID or secret not found");
  }

  // don't plan to call this on it's own, only through checkAndRefreshSpotifyToken.
  // But have this guard here in case it happens accidentally
  if (!user.spotifyRefreshToken) {
    throw new Error("User has no Spotify refresh token, reauthorize");
  }

  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: user.spotifyRefreshToken,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error("Token response not ok: " + (await tokenResponse.text()));
    }

    const tokenData = await tokenResponse.json();

    await db.user.update({
      where: { id: user.id },
      data: {
        spotifyAccessToken: tokenData.access_token,
        spotifyTokenExpiresAt: new Date(
          Date.now() + tokenData.expires_in * 1000,
        ),
        // usually not included but they can be rotated
        ...(tokenData.refresh_token && {
          spotifyRefreshToken: tokenData.refresh_token,
        }),
      },
    });

    return tokenData.access_token;
  } catch (error) {
    console.error("Error refreshing Spotify token:", error);
    throw new Error(
      "Failed to refresh Spotify token: " + (error as Error).message,
    );
  }
};
