import { AudioController } from "./AudioController";
import { useMusicPlayerStore } from "./MusicPlayerStore";

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to start anchor audio and set metadata
export const startAnchorAudio = async (): Promise<void> => {
  const anchorAudio = document.getElementById(
    "media-anchor",
  ) as HTMLAudioElement;
  if (anchorAudio) {
    try {
      await anchorAudio.play();
      navigator.mediaSession.playbackState = "playing";
    } catch (error) {
      console.warn("Failed to start anchor audio:", error);
    }
  }
};

export const pauseAnchorAudio = (): void => {
  const anchorAudio = document.getElementById(
    "media-anchor",
  ) as HTMLAudioElement;
  if (anchorAudio) {
    anchorAudio.pause();
    navigator.mediaSession.playbackState = "paused";
  }
};

export const setMediaSessionMetadata = (metadata: MediaMetadataInit | null) => {
  if (!("mediaSession" in navigator)) return;
  if (metadata) {
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
  }
};

// TODO: repetitive to useMusicPlayer, make an actions file
// phase out useMusicPlayer
// wrap all in try catches as well
export const setupMediaSession = (metadata: MediaMetadataInit | null) => {
  if (!("mediaSession" in navigator)) return;

  // Set action handlers
  navigator.mediaSession.setActionHandler("play", () => {
    void (async () => {
      const state = useMusicPlayerStore.getState();
      state.setLoadedOnce(true);
      if (!state.currentPlaylist || state.currentPlaylist.length === 0) {
        console.warn("No playlist loaded");
        return;
      }
      const currentTrack = state.currentPlaylist[state.currentTrackIndex];
      if (!currentTrack) {
        console.warn("No current track");
        return;
      }

      if (!state.controller) {
        try {
          const newController = new AudioController();

          await newController.loadPlaylist(
            state.currentPlaylist,
            state.currentTrackIndex,
          );
          state.setController(newController);
          state.setIsLoaded(true);
          await newController.play();
          await newController.setVolume(state.volume);
          state.setDuration(newController.duration);
          state.setIsPlaying(true);
        } catch (error) {
          console.error("Failed to load playlist:", error);
        }
      } else if (state.controller && state.isLoaded) {
        const controllerCurrentIndex = state.controller.getCurrentIndex();
        if (controllerCurrentIndex !== state.currentTrackIndex) {
          try {
            await state.controller.pause();
            state.setIsPlaying(false);
            await state.controller.loadPlaylist(
              state.currentPlaylist,
              state.currentTrackIndex,
            );
            state.setCurrentTime(0);
            state.setDuration(state.controller.duration);
            await state.controller.play();
            await state.controller.setVolume(state.volume);
          } catch (error) {
            console.error("Failed to load new track:", error);
          }
        } else {
          // TODO: might not need all above
          // these things should exist already otherwise we would be out of sync
          // ie: can't start playing from the mediaSession from nothing, the site was first
          pauseAnchorAudio();
          await state.controller.play();
          setTimeout(() => {
            void startAnchorAudio();
            const metadata = state.controller?.getMediaMetadata() ?? null;
            setMediaSessionMetadata(metadata);
          }, 1500);
        }
        state.setIsPlaying(true);
      }
    })();
  });
  navigator.mediaSession.setActionHandler("pause", () => {
    void (async () => {
      const state = useMusicPlayerStore.getState();
      if (state.controller && state.isLoaded) {
        try {
          await state.controller.pause();
          state.setIsPlaying(false);
          navigator.mediaSession.playbackState = "paused";
          // don't actually pause the anchor here, loses mediaSession
          // worry about proper time keeping later.
        } catch (error) {
          console.error("Failed to pause from media session:", error);
        }
      }
    })();
  });
  navigator.mediaSession.setActionHandler("nexttrack", () => {
    void (async () => {
      const state = useMusicPlayerStore.getState();
      const hasNextTrack = state.currentPlaylist
        ? state.currentTrackIndex < state.currentPlaylist.length - 1
        : false;
      if (state.currentPlaylist && state.controller && hasNextTrack) {
        pauseAnchorAudio();
        await state.controller.pause();
        state.setIsPlaying(false);
        state.setCurrentTrackIndex(state.currentTrackIndex + 1);
        state.setCurrentTime(0.01);
        state.setDuration(0.9);
        await state.controller.nextTrack();
        await state.controller.setVolume(state.volume);
        state.setDuration(state.controller.duration);
        state.setIsPlaying(true);

        setTimeout(() => {
          void startAnchorAudio();
          const metadata = state.controller?.getMediaMetadata() ?? null;
          setMediaSessionMetadata(metadata);
        }, 1500);
      }
    })();
  });
  navigator.mediaSession.setActionHandler("previoustrack", () => {
    void (async () => {
      const state = useMusicPlayerStore.getState();
      const hasPreviousTrack = state.currentTrackIndex > 0;
      if (state.currentPlaylist && state.controller && hasPreviousTrack) {
        if (state.currentTime > 3) {
          await state.controller.seekTo(0);
          state.setCurrentTime(0);
        } else {
          pauseAnchorAudio();
          state.setCurrentTrackIndex(state.currentTrackIndex - 1);
          state.setCurrentTime(0.01);
          state.setDuration(0.9);
          await state.controller.previousTrack();
          await state.controller.setVolume(state.volume);
          state.setDuration(state.controller.duration);
          state.setIsPlaying(true);

          setTimeout(() => {
            void startAnchorAudio();
            const metadata = state.controller?.getMediaMetadata() ?? null;
            setMediaSessionMetadata(metadata);
          }, 1500);
        }
      }
    })();
  });
  // ios is just displaying the 10 second seeks, override to next and previous track flow
  navigator.mediaSession.setActionHandler("seekforward", () => {
    void (async () => {
      const state = useMusicPlayerStore.getState();
      const hasNextTrack = state.currentPlaylist
        ? state.currentTrackIndex < state.currentPlaylist.length - 1
        : false;
      if (state.currentPlaylist && state.controller && hasNextTrack) {
        pauseAnchorAudio();
        await state.controller.pause();
        state.setIsPlaying(false);
        state.setCurrentTrackIndex(state.currentTrackIndex + 1);
        state.setCurrentTime(0.01);
        state.setDuration(0.9);
        await state.controller.nextTrack();
        await state.controller.setVolume(state.volume);
        state.setDuration(state.controller.duration);
        state.setIsPlaying(true);

        setTimeout(() => {
          void startAnchorAudio();
          const metadata = state.controller?.getMediaMetadata() ?? null;
          setMediaSessionMetadata(metadata);
        }, 1500);
      }
    })();
  });
  navigator.mediaSession.setActionHandler("seekbackward", () => {
    void (async () => {
      const state = useMusicPlayerStore.getState();
      const hasPreviousTrack = state.currentTrackIndex > 0;
      if (state.currentPlaylist && state.controller && hasPreviousTrack) {
        if (state.currentTime > 3) {
          await state.controller.seekTo(0);
          state.setCurrentTime(0);
        } else {
          pauseAnchorAudio();
          state.setCurrentTrackIndex(state.currentTrackIndex - 1);
          state.setCurrentTime(0.01);
          state.setDuration(0.9);
          await state.controller.previousTrack();
          await state.controller.setVolume(state.volume);
          state.setDuration(state.controller.duration);
          state.setIsPlaying(true);

          setTimeout(() => {
            void startAnchorAudio();
            const metadata = state.controller?.getMediaMetadata() ?? null;
            setMediaSessionMetadata(metadata);
          }, 1500);
        }
      }
    })();
  });

  if (metadata) {
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
  }
};
