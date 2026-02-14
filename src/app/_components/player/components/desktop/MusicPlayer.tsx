"use client";

import { ProgressBar } from "./ProgressBar";
import { PlaybackControl } from "./PlaybackControl";
import { VolumeControl } from "./VolumeControl";
import {
  useMusicPlayerStore,
  useMusicPlayerComputed,
} from "~/app/_components/player/MusicPlayerStore";
import {
  play,
  pause,
  next,
  previous,
  handleVolumeChange,
  handleProgressChange,
  handleProgressCommit,
} from "../../musicPlayerActions";

export const MusicPlayer = () => {
  const loadedOnce = useMusicPlayerStore((s) => s.loadedOnce);

  const { currentTrack } = useMusicPlayerComputed();

  if (!loadedOnce) return null;

  return (
    <div className="bg-background/40 fixed bottom-10 left-1/2 z-100 flex -translate-x-1/2 items-center gap-4 rounded-full p-4 backdrop-blur-[2px]">
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
