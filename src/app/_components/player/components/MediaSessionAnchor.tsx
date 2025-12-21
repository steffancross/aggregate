"use client";

export const AppMediaAnchor = () => {
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
