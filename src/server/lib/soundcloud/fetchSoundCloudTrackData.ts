import { type TrackData } from "~/server/lib/getTrackData";

interface SoundCloudResolveResponse {
  title: string;
  duration: number;
  artwork_url: string;
  id: number;
  user: {
    username: string;
  };
}
// TODO: make this still function without auth and test it
export async function fetchSoundCloudTrackData(
  url: string,
): Promise<TrackData> {
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
    console.error("Token error:", errorText);
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
    console.error("Error response:", errorText);
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
