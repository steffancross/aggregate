"use client";

import { useEffect, useState } from "react";
import { AudioController } from "./AudioController";
import type { Track } from "./types/player";
import { Slider } from "~/components/ui/slider";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { formatTime } from "./utils";

const testPlaylist: Track[] = [
  {
    title: "Test Track 1",
    url: "https://soundcloud.com/evens/evens-year-walk-free-download",
    source: "soundcloud",
  },
  {
    title: "Test Track 2",
    url: "https://soundcloud.com/janu4ryss/dont-want-u-prod-me",
    source: "soundcloud",
  },
];

export default function MusicPlayer() {
  const [controller, setController] = useState<AudioController | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    // Load SoundCloud API script
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

  const updateDuration = async () => {
    if (controller && isLoaded) {
      const duration = await controller.getDuration();
      setDuration(duration);
    }
  };

  useEffect(() => {
    void updateDuration();
  }, [controller, isLoaded, updateDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && controller && isLoaded) {
      interval = setInterval(() => {
        if (!isSeeking) {
          void controller.getCurrentTime().then((time) => {
            setCurrentTime(time);
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, controller, isLoaded, isSeeking]);

  const play = async () => {
    if (!controller) {
      try {
        const controller = new AudioController();
        await controller.loadPlaylist(testPlaylist);
        setController(controller);
        setIsLoaded(true);
        await controller.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to load playlist:", error);
      }
    }

    if (controller && isLoaded) {
      await controller.play();
      setIsPlaying(true);
    }
  };

  const pause = async () => {
    if (controller && isLoaded) {
      await controller.pause();
      setIsPlaying(false);
    }
  };

  const next = async () => {
    if (controller && isLoaded) {
      await controller.nextTrack();
      void updateDuration();
    }
  };

  const previous = async () => {
    if (controller && isLoaded) {
      await controller.previousTrack();
      void updateDuration();
    }
  };

  const handleVolumeChange = (volume: number[]) => {
    if (controller && isLoaded && volume[0]) {
      controller.setVolume(volume[0]);
      setVolume(volume[0]);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (controller && isLoaded && value[0] !== undefined) {
      setIsSeeking(true);
      setCurrentTime(value[0]);
    }
  };

  const handleProgressCommit = (value: number[]) => {
    if (controller && isLoaded && value[0] !== undefined) {
      controller.seekTo(value[0] * 1000);
      setIsSeeking(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
      <div id="player-container" className="mb-4">
        {/* Iframe will be inserted here */}
      </div>

      <div className="flex items-baseline space-x-4">
        <Button
          onClick={previous}
          className="px-4 py-2 text-white disabled:bg-gray-300"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          onClick={isPlaying ? pause : play}
          className="bg-green-500 disabled:bg-gray-300"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          onClick={next}
          className="px-4 py-2 text-white disabled:bg-gray-300"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <Slider
          value={[currentTime]}
          onValueChange={handleProgressChange}
          onValueCommit={handleProgressCommit}
          max={duration}
          step={1}
          className="w-100"
        />

        <span className="w-24">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <Popover>
          <PopoverTrigger>
            <Volume2 className="h-4 w-4 bg-black text-white" />
          </PopoverTrigger>
          <PopoverContent side="top" className="w-fit">
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              orientation="vertical"
              className="w-fit"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
