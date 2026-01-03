"use client";

import { useMusicPlayer } from "../../useMusicPlayer";
import { ProgressBar } from "./ProgressBar";
import { PlaybackControl } from "./PlaybackControl";
import { VolumeControl } from "./VolumeControl";
import { useMusicPlayerStore } from "../../MusicPlayerStore";

export const MusicPlayer = () => {
  const { loadedOnce, isPlaying, volume, duration, currentTime } =
    useMusicPlayerStore();

  const {
    play,
    pause,
    next,
    previous,
    handleVolumeChange,
    handleProgressChange,
    handleProgressCommit,
  } = useMusicPlayer();

  if (!loadedOnce) return null;

  return (
    <div className="bg-background/40 fixed bottom-10 left-1/2 z-100 flex -translate-x-1/2 gap-4 rounded-full p-3 backdrop-blur-[2px]">
      <PlaybackControl
        isPlaying={isPlaying}
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrevious={previous}
      />
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onProgressChange={handleProgressChange}
        onProgressCommit={handleProgressCommit}
      />
      <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />
    </div>
  );
};
