import { useMusicPlayerStore } from "./MusicPlayerStore";

export const loadPlayerScripts = (): void | (() => void) => {
  if (typeof document === "undefined") return () => undefined;

  const scScript = document.createElement("script");
  scScript.src = "https://w.soundcloud.com/player/api.js";
  scScript.async = true;
  scScript.onload = () => {
    // eslint-disable-next-line no-console
    console.log("SoundCloud API loaded");
  };
  document.head.appendChild(scScript);

  const ytScript = document.createElement("script");
  ytScript.src = "https://www.youtube.com/iframe_api";
  ytScript.async = true;
  ytScript.onload = () => {
    // eslint-disable-next-line no-console
    console.log("YouTube API loaded");
  };
  document.head.appendChild(ytScript);

  if (typeof window !== "undefined" && !window.onSpotifyWebPlaybackSDKReady) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.onSpotifyWebPlaybackSDKReady = () => {};
  }

  const spotifyScript = document.createElement("script");
  spotifyScript.src = "https://sdk.scdn.co/spotify-player.js";
  spotifyScript.async = true;
  spotifyScript.onload = () => {
    // eslint-disable-next-line no-console
    console.log("Spotify API loaded");
  };
  document.body.appendChild(spotifyScript);

  return () => {
    const sc = document.querySelector(
      'script[src="https://w.soundcloud.com/player/api.js"]',
    );
    const yt = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    const sp = document.querySelector(
      'script[src="https://sdk.scdn.co/spotify-player.js"]',
    );
    if (sc) document.head.removeChild(sc);
    if (yt) document.head.removeChild(yt);
    if (sp) document.body.removeChild(sp);
  };
};

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to start anchor audio and set metadata
export const startAnchorAudio = async (): Promise<void> => {
  const anchorAudio = document.getElementById(
    "media-anchor",
  ) as HTMLAudioElement;
  if (anchorAudio) {
    try {
      await anchorAudio.play();
      navigator.mediaSession.playbackState = "playing";
    } catch (error) {
      console.warn("Failed to start anchor audio:", error);
    }
  }
};

export const pauseAnchorAudio = (): void => {
  const anchorAudio = document.getElementById(
    "media-anchor",
  ) as HTMLAudioElement;
  if (anchorAudio) {
    anchorAudio.pause();
    navigator.mediaSession.playbackState = "paused";
  }
};

// TODO: find a better way to regain media session control, still too brittle
// see if events can be relied on or listening for audio starting with js maybe
export const scheduleAnchorAndMediaSession = (): void => {
  setTimeout(() => {
    void startAnchorAudio();
    const controller = useMusicPlayerStore.getState().controller;
    const metadata = controller?.getMediaMetadata() ?? null;
    setMediaSessionMetadata(metadata);
  }, 1500);
};

export const setMediaSessionMetadata = (metadata: MediaMetadataInit | null) => {
  if (!("mediaSession" in navigator)) return;
  if (metadata) {
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
  }
};
