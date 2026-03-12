"use client";

import { useEffect } from "react";
import { setupMediaSession } from "~/app/_components/player/musicPlayerActions";
import { startProgressTimer } from "~/app/_components/player/progressTimer";
import { loadPlayerScripts } from "~/app/_components/player/utils";

export const AppMediaAnchor = () => {
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
