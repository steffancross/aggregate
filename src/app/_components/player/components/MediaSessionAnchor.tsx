"use client";

import { useEffect } from "react";
import { loadPlayerScripts } from "~/app/_components/player/utils";
import { startProgressTimer } from "~/app/_components/player/progressTimer";
import { setupMediaSession } from "~/app/_components/player/musicPlayerActions";

export const AppMediaAnchor = () => {
  useEffect(() => {
    const cleanup = loadPlayerScripts();
    return cleanup;
  }, []);

  useEffect(() => {
    startProgressTimer();
  }, []);

  useEffect(() => {
    setupMediaSession(null);
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
