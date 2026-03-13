"use client";

import { useEffect } from "react";
import { setupMediaSession } from "~/app/_components/player/musicPlayerActions";
import { startProgressTimer } from "~/app/_components/player/progressTimer";
import { loadPlayerScripts } from "~/app/_components/player/utils";
import { api } from "~/trpc/react";
import { useMusicPlayerStore } from "../MusicPlayerStore";
import { SpotifyAdapter } from "../adapters/SpotifyAdapter";

export const AppMediaAnchor = () => {
  const { data: spotifyAuth } = api.user.userConnectedToSpotify.useQuery();

  useEffect(() => {
    const cleanup = loadPlayerScripts();
    return cleanup;
  }, []);

  useEffect(() => {
    startProgressTimer();
  }, []);

  useEffect(() => {
    setupMediaSession();
  }, []);

  useEffect(() => {
    if (!spotifyAuth) return;
    const existingAdapter =
      useMusicPlayerStore.getState().preInitializedSpotifyAdapter;
    if (existingAdapter) return;

    const adapter = new SpotifyAdapter();
    adapter
      .initializeWidget()
      .then(() => {
        useMusicPlayerStore.getState().setPreInitializedSpotifyAdapter(adapter);
      })
      .catch((error) => {
        console.error("Failed to initialize Spotify adapter", error);
      });
  }, [spotifyAuth]);

  return (
    <>
      <audio
        src="/media-anchor.mp3"
        preload="auto"
        loop
        playsInline
        style={{ display: "none" }}
        id="media-anchor"
      />
    </>
  );
};
