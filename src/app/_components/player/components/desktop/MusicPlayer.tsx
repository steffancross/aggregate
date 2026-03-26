"use client";

import { useUser } from "@clerk/nextjs";
import { useMusicPlayerComputed } from "~/app/_components/player/MusicPlayerStore";
import {
  handleProgressChange,
  handleProgressCommit,
  handleVolumeChange,
  next,
  pause,
  play,
  previous,
} from "../../musicPlayerActions";
import { PlaybackControl } from "./PlaybackControl";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";

export const MusicPlayer = () => {
  const { currentTrack } = useMusicPlayerComputed();
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="bg-background/40 flex w-full items-center gap-4 border border-amber-50 p-4">
      <PlaybackControl
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrevious={previous}
      />
      <div className="flex flex-col">
        <div className="absolute top-[6px] flex gap-2">
          <p className="line-clamp-1 truncate text-xs font-semibold">
            {currentTrack?.title}
          </p>
          <p className="text-muted-foreground line-clamp-1 truncate text-xs">
            {currentTrack?.artists
              .map((artist) => artist.artistName)
              .join(", ")}
          </p>
        </div>
        <ProgressBar
          onProgressChange={handleProgressChange}
          onProgressCommit={handleProgressCommit}
        />
      </div>
      <VolumeControl onVolumeChange={handleVolumeChange} />
    </div>
  );
};
