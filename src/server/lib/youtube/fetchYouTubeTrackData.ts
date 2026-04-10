import { Temporal } from "@js-temporal/polyfill";
import { type TrackData } from "~/server/lib/getTrackData";

interface YoutubeResponse {
  items: {
    id: string;
    snippet: {
      title: string;
      thumbnails: {
        default?: {
          url: string;
        };
        standard?: {
          url: string;
        };
        maxres?: {
          url: string;
        };
      };
      channelTitle: string;
    };
    contentDetails: {
      duration: string;
    };
  }[];
}

// TODO: brittle :)
const getYoutubeId = (url: string) => {
  const parsed = new URL(url);
  return parsed.searchParams.get("v");
};

// TODO: make this still function without auth and test it
export async function fetchYouTubeTrackData(url: string): Promise<TrackData> {
  const youtubeId = getYoutubeId(url);
  const apiKey = process.env.YT_API_KEY;

  const youtubeUrl = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&key=${apiKey}&part=snippet,contentDetails`;

  const res = await fetch(youtubeUrl);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("YouTube API error:", errorText);
    throw new Error(
      `YouTube API error: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  const data = (await res.json()) as YoutubeResponse;
  const videoData = data.items[0];

  if (!data.items || data.items.length === 0 || !videoData) {
    throw new Error(`No video found for YouTube ID: ${youtubeId}`);
  }

  const duration = Temporal.Duration.from(
    videoData.contentDetails.duration,
  ).total({ unit: "millisecond" });

  return {
    title: videoData.snippet.title,
    artist: [videoData.snippet.channelTitle],
    album: "",
    duration: duration,
    artworkUrl:
      videoData.snippet.thumbnails.maxres?.url ??
      videoData.snippet.thumbnails.standard?.url ??
      "",
    sourceUrl: url,
    sourceId: videoData.id,
    source: "youtube" as const,
  };
}
