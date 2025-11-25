import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

export const GET = async () => {
  const { userId } = await auth();

  if (!userId) {
    console.error("Spotify login attempted without userId");
    // TODO
    return NextResponse.redirect(
      new URL("/account?error=unauthorized", "http://localhost:3000"),
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_SECRET_KEY;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = "user-read-private streaming";
  const state = crypto.randomUUID();

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("Spotify env variables not found:", {
      clientId,
      clientSecret,
      redirectUri,
    });
    // TODO
    return NextResponse.redirect(
      new URL("/account?error=config_error", "http://localhost:3000"),
    );
  }

  await db.spotifyAuthState.create({
    data: {
      state: state,
      userId: userId,
    },
  });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scope,
    state: state,
  });

  return NextResponse.redirect(
    "https://accounts.spotify.com/authorize?" + params.toString(),
  );
};
