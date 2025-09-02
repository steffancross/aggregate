import { useEffect, useState, useCallback } from "react";
import { AudioController } from "./AudioController";
import type { Track } from "./types/player";

const testPlaylist: Track[] = [
  {
    title: "year walk",
    url: "https://soundcloud.com/evens/evens-year-walk-free-download",
    source: "soundcloud",
    // duration: 120,
  },
  {
    title: "dont want",
    url: "https://soundcloud.com/janu4ryss/dont-want-u-prod-me",
    source: "soundcloud",
    // duration: 180,
  },
];

export function useMusicPlayer() {
  const [controller, setController] = useState<AudioController | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // load soundcloud script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    script.onload = () => {
      console.log("SoundCloud API loaded");
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // timer to update current time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && controller && isLoaded) {
      interval = setInterval(() => {
        if (!isSeeking) {
          void controller.getCurrentTime().then((time) => {
            setCurrentTime(time);
          });
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, controller, isLoaded, isSeeking]);

  const play = useCallback(async () => {
    if (!controller) {
      try {
        const controller = new AudioController();

        // TODO: this area is a little funky, refactor after logic of fetching from playlist updating data of songs.
        controller.onTrackEnd(() => {
          setCurrentTime(0);
          setDuration(controller.duration);
        });

        await controller.loadPlaylist(testPlaylist);
        setController(controller);
        setIsLoaded(true);
        await controller.play();
        controller.setVolume(volume);
        setDuration(controller.duration);
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to load playlist:", error);
      }
    }

    if (controller && isLoaded) {
      await controller.play();
      setIsPlaying(true);
    }
  }, [controller, isLoaded, volume]);

  const pause = useCallback(async () => {
    if (controller && isLoaded) {
      await controller.pause();
      setIsPlaying(false);
    }
  }, [controller, isLoaded]);

  const next = useCallback(async () => {
    if (controller && isLoaded) {
      // hacky loading state to get the slider and duration to properly display while loading next track
      setCurrentTime(0.01);
      setDuration(0.9);
      await controller.nextTrack();
      controller.setVolume(volume);
      setDuration(controller.duration);
    }
  }, [controller, isLoaded, volume]);

  const previous = useCallback(async () => {
    if (controller && isLoaded) {
      // user expectation, if into the song, hitting previous should go back to the start
      // if at the start, go previous track
      if (currentTime > 3) {
        controller.seekTo(0);
        setCurrentTime(0);
        return;
      }

      setCurrentTime(0.01);
      setDuration(0.9);
      await controller.previousTrack();
      controller.setVolume(volume);
      setDuration(controller.duration);
    }
  }, [controller, isLoaded, volume, currentTime]);

  const handleVolumeChange = useCallback(
    (volume: number[]) => {
      if (volume[0] !== undefined) {
        setVolume(volume[0]);

        if (controller && isLoaded) {
          controller.setVolume(volume[0]);
        }
      }
    },
    [controller, isLoaded],
  );

  const handleProgressChange = useCallback(
    (value: number[]) => {
      if (controller && isLoaded && value[0] !== undefined) {
        setIsSeeking(true);
        setCurrentTime(value[0]);
      }
    },
    [controller, isLoaded],
  );

  const handleProgressCommit = useCallback(
    (value: number[]) => {
      if (controller && isLoaded && value[0] !== undefined) {
        controller.seekTo(value[0] * 1000);
        setIsSeeking(false);
      }
    },
    [controller, isLoaded],
  );

  return {
    isPlaying,
    volume,
    duration,
    currentTime,
    play,
    pause,
    next,
    previous,
    handleVolumeChange,
    handleProgressChange,
    handleProgressCommit,
  };
}
