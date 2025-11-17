"use server";

import type { SongSource } from "@prisma/client";
import { Temporal } from "@js-temporal/polyfill";

interface SoundCloudResolveResponse {
  title: string;
  duration: number;
  artwork_url: string;
  id: number;
  user: {
    username: string;
  };
}

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
      return await fetchSoundCloudMetadata(url);
    } else {
      return await fetchYouTubeMetadata(url);
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get track data");
  }
}

async function fetchSoundCloudMetadata(url: string) {
  const clientId = process.env.SC_CLIENT_ID;
  const clientSecret = process.env.SC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SoundCloud env variables not found");
  }

  // access token
  const tokenResponse = await fetch("https://api.soundcloud.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.log("Token error:", errorText);
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  const accessToken = tokenData.access_token;

  const apiUrl = `https://api.soundcloud.com/resolve.json?url=${encodeURIComponent(url)}`;

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Error response:", errorText);
    throw new Error(
      `SoundCloud API error: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  const data = (await res.json()) as SoundCloudResolveResponse;

  return {
    title: data.title,
    artist: data.user?.username ? [data.user.username] : [],
    album: "",
    duration: data.duration,
    artworkUrl: data.artwork_url || "",
    sourceUrl: url,
    sourceId: data.id.toString(),
    source: "soundcloud" as const,
  };
}

interface YoutubeResponse {
  items: {
    id: string;
    snippet: {
      title: string;
      thumbnails: {
        default: {
          url: string;
        };
        standard: {
          url: string;
        };
        maxres: {
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

const getYoutubeId = (url: string) => {
  const parsed = new URL(url);
  return parsed.searchParams.get("v");
};

async function fetchYouTubeMetadata(url: string) {
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
      videoData.snippet.thumbnails.maxres.url ||
      videoData.snippet.thumbnails.standard.url ||
      "",
    sourceUrl: url,
    sourceId: videoData.id,
    source: "youtube" as const,
  };
}
