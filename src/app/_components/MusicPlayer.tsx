"use client";

import { useEffect, useState } from "react";
import { AudioController } from "./player/AudioController";
import type { Track } from "./player/types/player";
import { Slider } from "~/components/ui/slider";
import { Button } from "~/components/ui/button";

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
    }
  };

  const previous = async () => {
    if (controller && isLoaded) {
      await controller.previousTrack();
    }
  };

  const handleVolumeChange = (volume: number[]) => {
    if (controller && isLoaded && volume[0]) {
      controller.setVolume(volume[0]);
      setVolume(volume[0]);
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">SoundCloud Adapter Test</h1>

      <div id="player-container" className="mb-4">
        {/* Iframe will be inserted here */}
      </div>

      <div className="flex items-baseline space-x-4">
        <Button
          onClick={play}
          disabled={isPlaying}
          className="rounded bg-green-500 disabled:bg-gray-300"
        >
          Play
        </Button>

        <Button
          onClick={pause}
          disabled={!isLoaded || !isPlaying}
          className="rounded bg-red-500 disabled:bg-gray-300"
        >
          Pause
        </Button>

        <Button
          onClick={next}
          disabled={!isLoaded}
          className="rounded bg-yellow-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Next
        </Button>

        <Button
          onClick={previous}
          disabled={!isLoaded}
          className="rounded bg-purple-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Previous
        </Button>

        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          orientation="vertical"
          className="mt-6"
        />
      </div>

      <div className="mt-4">
        <p>Status: {isLoaded ? "Ready" : "Not loaded"}</p>
        <p>Playing: {isPlaying ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}
