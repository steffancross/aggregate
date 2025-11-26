"use server";

import {
  getTrackData as getTrackDataServer,
  type TrackData,
} from "~/server/lib/getTrackData";
import { auth } from "@clerk/nextjs/server";

export const getTrackData = async (url: string): Promise<TrackData> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("getTrackData called without userId");
  }

  return await getTrackDataServer({ url, clerkId: userId });
};
