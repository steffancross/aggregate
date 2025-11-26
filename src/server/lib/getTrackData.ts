import { type SongSource } from "@prisma/client";
import { fetchSoundCloudTrackData } from "./soundcloud/fetchSoundCloudTrackData";
import { fetchYouTubeTrackData } from "./youtube/fetchYouTubeTrackData";
import { fetchSpotifyTrackData } from "./spotify/fetchSpotifyTrackData";

export interface TrackData {
  id?: number;
  title: string;
  artist: string[];
  album: string;
  duration: number;
  artworkUrl: string;
  sourceUrl: string;
  sourceId: string;
  source: SongSource;
}

export async function getTrackData({
  url,
  clerkId,
}: {
  url: string;
  clerkId: string;
}): Promise<TrackData> {
  const sources: SongSource[] = ["soundcloud", "youtube", "spotify"];
  const source = sources.find((s) => url.includes(s)) ?? null;

  if (!source) {
    throw new Error("Invalid source");
  }

  switch (source) {
    case "soundcloud":
      return await fetchSoundCloudTrackData(url);
    case "youtube":
      return await fetchYouTubeTrackData(url);
    case "spotify":
      return await fetchSpotifyTrackData({ url, clerkId });
    default:
      throw new Error("Invalid source");
  }
}
