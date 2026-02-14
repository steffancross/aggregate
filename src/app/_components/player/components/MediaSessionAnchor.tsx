"use client";

import { useEffect } from "react";
import { loadPlayerScripts } from "~/app/_components/player/utils";

export const AppMediaAnchor = () => {
  useEffect(() => {
    const cleanup = loadPlayerScripts();
    return cleanup;
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
