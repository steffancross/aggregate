import { useMusicPlayerStore } from "./MusicPlayerStore";
import { next } from "./musicPlayerActions";

// TODO: still may be a better way to do this, revisit
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick(): void {
  const state = useMusicPlayerStore.getState();
  const {
    isPlaying,
    isLoaded,
    isSeeking,
    controller,
    duration,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    currentPlaylist,
    currentTrackIndex,
  } = state;

  if (!isPlaying || !isLoaded || isSeeking || !controller) return;

  void controller.getCurrentTime().then((time) => {
    setCurrentTime(time);

    if (duration > 0 && time >= duration - 0.5) {
      const hasNextTrack = currentPlaylist
        ? currentTrackIndex < currentPlaylist.length - 1
        : false;
      if (hasNextTrack) {
        void next();
      } else {
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
      }
    }
  });
}

/**
 * Subscribes to the store and runs a 250ms interval while isPlaying && isLoaded.
 * Updates currentTime and handles end-of-track (next or stop). Call once at app init.
 */
export function startProgressTimer(): () => void {
  const check = () => {
    const { isPlaying, isLoaded } = useMusicPlayerStore.getState();
    if (isPlaying && isLoaded) {
      intervalId ??= setInterval(tick, 250);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
  check(); // run once so we're correct if already playing (e.g. HMR)
  return useMusicPlayerStore.subscribe(check);
}
