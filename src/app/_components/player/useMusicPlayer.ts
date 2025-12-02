import { useEffect, useCallback } from "react";
import { AudioController } from "./AudioController";
import {
  useMusicPlayerStore,
  useMusicPlayerComputed,
} from "./MusicPlayerStore";

export function useMusicPlayer() {
  const {
    currentPlaylist,
    currentTrackIndex,
    isPlaying,
    isLoaded,
    volume,
    currentTime,
    controller,
    isSeeking,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoaded,
    setCurrentTrackIndex,
    setVolume,
    setIsSeeking,
    setLoadedOnce,
    setController,
    duration,
  } = useMusicPlayerStore();

  const { hasNextTrack, hasPreviousTrack } = useMusicPlayerComputed();

  // load scripts
  useEffect(() => {
    const scScript = document.createElement("script");
    scScript.src = "https://w.soundcloud.com/player/api.js";
    scScript.async = true;
    scScript.onload = () => {
      console.log("SoundCloud API loaded");
    };
    document.head.appendChild(scScript);

    const ytScript = document.createElement("script");
    ytScript.src = "https://www.youtube.com/iframe_api";
    ytScript.async = true;
    ytScript.onload = () => {
      console.log("YouTube API loaded");
    };
    document.head.appendChild(ytScript);

    const spotifyScript = document.createElement("script");
    spotifyScript.src = "https://sdk.scdn.co/spotify-player.js";
    spotifyScript.async = true;
    spotifyScript.onload = () => {
      console.log("Spotify API loaded");
    };
    document.body.appendChild(spotifyScript);

    return () => {
      document.head.removeChild(scScript);
      document.head.removeChild(ytScript);
      document.body.removeChild(spotifyScript);
    };
  }, []);

  // timer to update current time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && isLoaded) {
      interval = setInterval(() => {
        if (!isSeeking && controller) {
          void controller.getCurrentTime().then((time) => {
            setCurrentTime(time);

            if (duration > 0 && time >= duration - 0.5) {
              if (hasNextTrack) {
                void next();
              } else {
                // End of playlist
                setCurrentTime(0);
                setDuration(0);
                setIsPlaying(false);
              }
            }
          });
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    // next is a useCallback with its own dependencies, no need to include here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isPlaying,
    isLoaded,
    isSeeking,
    setCurrentTime,
    controller,
    setDuration,
    setIsPlaying,
    hasNextTrack,
    duration,
  ]);

  const play = useCallback(async () => {
    setLoadedOnce(true);
    // needed the freshest values from the store as before when calling play,
    // the react state hadn't updated yet with the new values.
    // other areas aren't same tick updates so it should be fine.
    const { currentPlaylist, currentTrackIndex } =
      useMusicPlayerStore.getState();

    if (!currentPlaylist || currentPlaylist.length === 0) {
      console.warn("No playlist loaded");
      return;
    }

    const currentTrack = currentPlaylist[currentTrackIndex];
    if (!currentTrack) {
      console.warn("No current track");
      return;
    }

    if (!controller) {
      try {
        const newController = new AudioController();

        await newController.loadPlaylist(currentPlaylist, currentTrackIndex);
        setController(newController);
        setIsLoaded(true);
        await newController.play();
        await newController.setVolume(volume);
        setDuration(newController.duration);
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to load playlist:", error);
      }
    } else if (controller && isLoaded) {
      const controllerCurrentIndex = controller.getCurrentIndex();
      if (controllerCurrentIndex !== currentTrackIndex) {
        try {
          await controller.loadPlaylist(currentPlaylist, currentTrackIndex);
          setCurrentTime(0);
          setDuration(controller.duration);
          await controller.play();
          await controller.setVolume(volume);
        } catch (error) {
          console.error("Failed to load new track:", error);
        }
      } else {
        await controller.play();
      }
      setIsPlaying(true);
    }
  }, [
    controller,
    isLoaded,
    volume,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setIsLoaded,
    setLoadedOnce,
    setController,
  ]);

  const pause = useCallback(async () => {
    if (controller && isLoaded) {
      await controller.pause();
      setIsPlaying(false);
    }
  }, [controller, isLoaded, setIsPlaying]);

  const next = useCallback(async () => {
    if (currentPlaylist && hasNextTrack && controller) {
      setCurrentTrackIndex(currentTrackIndex + 1);

      // hacky loading state to get the slider and duration to properly display while loading next track
      setCurrentTime(0.01);
      setDuration(0.9);

      await controller.nextTrack();
      await controller.setVolume(volume);
      setDuration(controller.duration);
      setIsPlaying(true);
    }
  }, [
    controller,
    volume,
    currentPlaylist,
    hasNextTrack,
    currentTrackIndex,
    setCurrentTrackIndex,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  ]);

  const previous = useCallback(async () => {
    if (currentPlaylist && hasPreviousTrack && controller) {
      // user expectation, if into the song, hitting previous should go back to the start
      // if at the start, go previous track
      if (currentTime > 3) {
        await controller.seekTo(0);
        setCurrentTime(0);
        return;
      }

      setCurrentTrackIndex(currentTrackIndex - 1);

      setCurrentTime(0.01);
      setDuration(0.9);

      await controller.previousTrack();
      await controller.setVolume(volume);
      setDuration(controller.duration);
      setIsPlaying(true);
    }
  }, [
    controller,
    volume,
    currentTime,
    currentPlaylist,
    hasPreviousTrack,
    setCurrentTime,
    currentTrackIndex,
    setDuration,
    setCurrentTrackIndex,
    setIsPlaying,
  ]);

  const handleVolumeChange = useCallback(
    async (volume: number[]) => {
      if (volume[0] !== undefined) {
        setVolume(volume[0]);

        if (controller && isLoaded) {
          await controller.setVolume(volume[0]);
        }
      }
    },
    [controller, isLoaded, setVolume],
  );

  const handleProgressChange = useCallback(
    (value: number[]) => {
      if (controller && isLoaded && value[0] !== undefined) {
        setIsSeeking(true);
        setCurrentTime(value[0]);
      }
    },
    [controller, isLoaded, setIsSeeking, setCurrentTime],
  );

  const handleProgressCommit = useCallback(
    async (value: number[]) => {
      if (controller && isLoaded && value[0] !== undefined) {
        await controller.seekTo(value[0] * 1000);
        setIsSeeking(false);
      }
    },
    [controller, isLoaded, setIsSeeking],
  );

  return {
    play,
    pause,
    next,
    previous,
    handleVolumeChange,
    handleProgressChange,
    handleProgressCommit,
  };
}
