"use server";

import {
  getTrackData as getTrackDataServer,
  type TrackData,
} from "~/server/lib/getTrackData";

export async function getTrackData(url: string): Promise<TrackData> {
  return await getTrackDataServer(url);
}
