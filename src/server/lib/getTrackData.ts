import { type SongSource } from "@prisma/client";
import { fetchSoundCloudTrackData } from "./soundcloud/fetchSoundCloudTrackData";
import { fetchYouTubeTrackData } from "./youtube/fetchYouTubeTrackData";

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

export async function getTrackData(url: string): Promise<TrackData> {
  const source = url.includes("soundcloud") ? "soundcloud" : "youtube";

  try {
    if (source === "soundcloud") {
      return await fetchSoundCloudTrackData(url);
    } else {
      return await fetchYouTubeTrackData(url);
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get track data");
  }
}
