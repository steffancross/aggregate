"use client";

import { useMusicPlayer } from "./useMusicPlayer";
import { ProgressBar } from "./components/ProgressBar";
import { PlaybackControl } from "./components/PlaybackControl";
import { VolumeControl } from "./components/VolumeControl";
import { useMusicPlayerStore } from "./MusicPlayerStore";

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
    <div className="fixed bottom-10 left-1/2 z-100 flex -translate-x-1/2 gap-4">
      <div id="player-container" className="mb-4">
        {/* Iframe will be inserted here */}
      </div>
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
