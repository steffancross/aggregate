"use client";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";

export const ArtworkDisplay = () => {
  const currentTrack = useMusicPlayerStore((s) => s.currentTrack);

  const artworkUrl = currentTrack?.artworkUrl;
  return (
    <div className="aspect-square w-full">
      {artworkUrl ? (
        <img
          src={artworkUrl}
          alt="Artwork"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="border-muted flex h-full w-full items-center justify-center border">
          <p className="text-muted-foreground">No artwork</p>
        </div>
      )}
    </div>
  );
};
