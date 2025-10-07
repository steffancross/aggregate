"use server";

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
  title: string;
  artist: string;
  album: string;
  duration: number;
  artworkUrl: string;
  sourceUrl: string;
  sourceId: string;
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
    artist: data.user?.username || "",
    album: "",
    duration: data.duration,
    artworkUrl: data.artwork_url || "",
    sourceUrl: url,
    sourceId: data.id.toString(),
  };
}

async function fetchYouTubeMetadata(url: string) {
  return {
    title: "",
    artist: "",
    album: "",
    duration: 0,
    artworkUrl: "",
    sourceUrl: url,
    sourceId: "",
  };
}
