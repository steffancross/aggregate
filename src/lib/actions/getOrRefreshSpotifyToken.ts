"use server";

import { getOrRefreshSpotifyToken as getOrRefreshSpotifyTokenServer } from "~/server/lib/spotify/getOrRefreshSpotifyToken";
import { auth } from "@clerk/nextjs/server";

export async function getOrRefreshSpotifyToken(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("getOrRefreshSpotifyToken called without userId");
  }

  return await getOrRefreshSpotifyTokenServer({ clerkId: userId });
}
