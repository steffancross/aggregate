import { NextResponse, type NextRequest } from "next/server";
import { db } from "~/server/db";

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  console.error("Spotify callback URL:", url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Spotify callback error:", error);
    return NextResponse.redirect(new URL(`/account?error=${error}`, url));
  }

  if (!code || !returnedState) {
    console.error("Spotify callback missing params:", { code, returnedState });
    return NextResponse.redirect(new URL("/account?error=missing_params", url));
  }

  const storedState = await db.spotifyAuthState.findUnique({
    where: {
      state: returnedState,
    },
  });

  if (returnedState !== storedState?.state) {
    console.error("State mismatch:", { returnedState, storedState });
    return NextResponse.redirect(new URL("/account?error=state_mismatch", url));
  }

  await db.spotifyAuthState.delete({
    where: { state: returnedState },
  });

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_SECRET_KEY;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("Spotify env variables not found:", {
      clientId,
      clientSecret,
      redirectUri,
    });
    return NextResponse.redirect(new URL("/account?error=config_error", url));
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
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        }),
      },
    );

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", await tokenResponse.text());
      return NextResponse.redirect(
        new URL("/account?error=token_exchange", url),
      );
    }

    const tokenData = (await tokenResponse.json()) as SpotifyTokenResponse;

    if (
      !tokenData.access_token ||
      !tokenData.refresh_token ||
      !tokenData.expires_in
    ) {
      console.error("Invalid token data:", tokenData);
      return NextResponse.redirect(
        new URL("/account?error=invalid_token", url),
      );
    }

    await db.user.update({
      where: { clerkId: storedState.userId },
      data: {
        spotifyAccessToken: tokenData.access_token,
        spotifyRefreshToken: tokenData.refresh_token,
        spotifyTokenExpiresAt: new Date(
          Date.now() + tokenData.expires_in * 1000,
        ),
      },
    });

    return NextResponse.redirect(new URL("/account?success=true", url));
  } catch (err) {
    console.error("Error exchanging token:", err);
    return NextResponse.redirect(new URL("/account?error=server_error", url));
  }
}
