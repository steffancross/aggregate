"use client";

import { useEffect } from "react";
import { loadPlayerScripts } from "~/app/_components/player/utils";
import { startProgressTimer } from "~/app/_components/player/progressTimer";

export const AppMediaAnchor = () => {
  useEffect(() => {
    const cleanup = loadPlayerScripts();
    return cleanup;
  }, []);

  useEffect(() => {
    startProgressTimer();
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
