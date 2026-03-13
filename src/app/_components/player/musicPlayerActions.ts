import { AudioController } from "./AudioController";
import { useMusicPlayerStore } from "./MusicPlayerStore";
import {
  pauseAnchorAudio,
  setMediaSessionMetadata,
  startAnchorAndUpdateMediaSession,
} from "./utils";

export const setupMediaSession = (): void => {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    console.warn("Media session not in navigator");
    return;
  }

  /*
   * ts has the return for this as void, but according to mdn docs it can be async
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler#examples
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  navigator.mediaSession.setActionHandler("play", async () => {
    await play();
    await startAnchorAndUpdateMediaSession();
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  navigator.mediaSession.setActionHandler("pause", async () => {
    await pause();
    setMediaSessionMetadata();
    /* 
    tend to lose the metadata when pausing even with this.
    playing or next/prev regains at least on mobile 
    */
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  navigator.mediaSession.setActionHandler("nexttrack", async () => {
    await next();
    await startAnchorAndUpdateMediaSession();
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  navigator.mediaSession.setActionHandler("previoustrack", async () => {
    await previous();
    await startAnchorAndUpdateMediaSession();
  });
  // iOS shows 10s seek buttons; map them to next/previous track
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  navigator.mediaSession.setActionHandler("seekforward", async () => {
    await next();
    await startAnchorAndUpdateMediaSession();
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  navigator.mediaSession.setActionHandler("seekbackward", async () => {
    await previous();
    await startAnchorAndUpdateMediaSession();
  });
};

export const pause = async (): Promise<void> => {
  const { controller, isLoaded, setIsPlaying } = useMusicPlayerStore.getState();

  if (controller && isLoaded) {
    await controller.pause();
    setIsPlaying(false);
    navigator.mediaSession.playbackState = "paused";
  }
};

export const previous = async (): Promise<void> => {
  const {
    currentPlaylist,
    controller,
    currentTime,
    currentTrackIndex,
    setCurrentTime,
    setCurrentTrackIndex,
    setDuration,
  } = useMusicPlayerStore.getState();

  const hasPreviousTrack = currentTrackIndex > 0;

  if (currentPlaylist && controller) {
    // user expectation, if into the song, hitting previous should go back to the start
    // if at the start, go previous track
    if (currentTime > 3) {
      await controller.seekTo(0);
      setCurrentTime(0);
      return;
    }

    if (hasPreviousTrack) {
      setCurrentTrackIndex(currentTrackIndex - 1);

      setCurrentTime(0.01);
      setDuration(0.9);

      await play();
    }
  }
};

export const next = async (): Promise<void> => {
  const {
    currentPlaylist,
    controller,
    currentTrackIndex,
    setCurrentTime,
    setCurrentTrackIndex,
    setDuration,
  } = useMusicPlayerStore.getState();

  const hasNextTrack = currentPlaylist
    ? currentTrackIndex < currentPlaylist.length - 1
    : false;

  if (currentPlaylist && hasNextTrack && controller) {
    setCurrentTrackIndex(currentTrackIndex + 1);

    // hacky loading state to get the slider and duration to properly display while loading next track
    setCurrentTime(0.01);
    setDuration(0.9);

    await play();
  }
};

export const play = async (): Promise<void> => {
  const {
    currentPlaylist,
    currentTrackIndex,
    setLoadedOnce,
    controller,
    setController,
    setIsLoaded,
    setIsPlaying,
    setDuration,
    setCurrentTime,
    volume,
  } = useMusicPlayerStore.getState();

  setLoadedOnce(true); // show the player on the app for the rest of the time

  if (!currentPlaylist || currentPlaylist.length === 0) {
    console.warn("No playlist loaded");
    return;
  }

  const currentTrack = currentPlaylist[currentTrackIndex];
  if (!currentTrack) {
    console.warn("No current track");
    return;
  }

  const loadTrack = async (controller: AudioController) => {
    await controller.loadPlaylist(currentPlaylist, currentTrackIndex);
    setIsLoaded(true);
    setCurrentTime(0);
    setDuration(controller.duration);
  };
  const syncAndPlay = async (controller: AudioController) => {
    try {
      await controller.play();
      await controller.setVolume(volume);
    } catch {
      setIsPlaying(false);
    }
  };

  if (!controller) {
    try {
      const newController = new AudioController();
      await loadTrack(newController);
      setController(newController);
      await syncAndPlay(newController);
      return;
    } catch (error) {
      console.error("Failed to load playlist:", error);
      return;
    }
  }

  if (controller) {
    const controllerCurrentIndex = controller.getCurrentIndex();
    // case of library where playlist is of length one so currentIndex will be the same
    const isNewTrack =
      controllerCurrentIndex !== currentTrackIndex ||
      controller.getCurrentTrack()?.trackId !== currentTrack?.trackId;

    if (!isNewTrack) {
      await syncAndPlay(controller);
      return;
    }

    // user clicked play on a track while already playing a different one
    try {
      await controller.pause();
      pauseAnchorAudio();
      setIsPlaying(false);

      await loadTrack(controller);
      await syncAndPlay(controller);
      return;
    } catch (error) {
      console.error("Failed to load new track:", error);
      return;
    }
  }
};

export const handleVolumeChange = async (volume: number[]): Promise<void> => {
  const { controller, setVolume, isLoaded } = useMusicPlayerStore.getState();

  if (volume[0] !== undefined) {
    setVolume(volume[0]);
    if (controller && isLoaded) {
      await controller.setVolume(volume[0]);
    }
  }
};

export const handleProgressChange = (value: number[]): void => {
  const { controller, setCurrentTime, isLoaded, setIsSeeking } =
    useMusicPlayerStore.getState();

  if (controller && isLoaded && value[0] !== undefined) {
    setIsSeeking(true);
    setCurrentTime(value[0]);
  }
};

export const handleProgressCommit = async (value: number[]): Promise<void> => {
  const { controller, setCurrentTime, isLoaded, setIsSeeking } =
    useMusicPlayerStore.getState();
  if (controller && isLoaded && value[0] !== undefined) {
    await controller.seekTo(value[0] * 1000);
    setCurrentTime(value[0]);
    setIsSeeking(false);
  }
};
