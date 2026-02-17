// https://developer.spotify.com/documentation/web-api/reference/get-track
import { type TrackData } from "~/server/lib/getTrackData";
import { getOrRefreshSpotifyToken } from "~/server/lib/spotify/getOrRefreshSpotifyToken";

interface SpotifyResponse {
  album: {
    album_type: "album" | "single" | "compilation";
    total_tracks: number;
    external_urls: {
      spotify: string;
    };
    name: string;
    images: {
      // various sizes of cover art, largest is the first in the array
      url: string;
      height: number;
      width: number;
    }[];
  };
  artists: {
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    name: string;
  }[];
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable: boolean;
  name: string;
}

// TODO: brittle :), find more cases where it may break
const getSpotifyId = (url: string) => {
  const u = new URL(url);
  const [, type, id] = u.pathname.split("/");
  if (type !== "track") return null;
  return id ?? null;
};

// TODO: testing
export const fetchSpotifyTrackData = async ({
  url,
  clerkId,
}: {
  url: string;
  clerkId: string;
}): Promise<TrackData> => {
  const token = await getOrRefreshSpotifyToken({ clerkId });
  const spotifyId = getSpotifyId(url);

  if (!spotifyId) {
    throw new Error("Invalid Spotify ID");
  }

  const spotifyUrl = `https://api.spotify.com/v1/tracks/${spotifyId}`;
  const response = await fetch(spotifyUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Spotify API error:", errorText);
    throw new Error(`Spotify API error: ${errorText}`);
  }

  const data = (await response.json()) as SpotifyResponse;

  return {
    title: data.name,
    artist: data.artists.map((artist) => artist.name),
    album: data.album.name ?? "",
    duration: data.duration_ms,
    artworkUrl: data.album.images[0]?.url ?? "",
    sourceUrl: url,
    sourceId: data.id,
    source: "spotify" as const,
  };
};
