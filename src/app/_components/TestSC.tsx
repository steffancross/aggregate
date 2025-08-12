"use client";

import { useEffect, useState } from "react";
import { AudioController } from "./player/AudioController";
import type { Track } from "./player/types/player";

const testTrack: Track = {
  title: "Test Track",
  url: "https://soundcloud.com/evens/evens-year-walk-free-download",
  source: "soundcloud",
};

export default function TestPlayer() {
  const [controller, setController] = useState<AudioController | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const loadTrack = async () => {
    try {
      const controller = new AudioController();
      await controller.loadTrack(testTrack);
      setController(controller);
      setIsLoaded(true);
      console.log("Track loaded successfully!");
    } catch (error) {
      console.error("Failed to load track:", error);
    }
  };

  const play = async () => {
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

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">SoundCloud Adapter Test</h1>

      <div id="player-container" className="mb-4">
        {/* Iframe will be inserted here */}
      </div>

      <div className="space-x-4">
        <button
          onClick={loadTrack}
          disabled={isLoaded}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          {isLoaded ? "Track Loaded" : "Load Track"}
        </button>

        <button
          onClick={play}
          disabled={!isLoaded}
          className="rounded bg-green-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Play
        </button>

        <button
          onClick={pause}
          disabled={!isLoaded}
          className="rounded bg-red-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Pause
        </button>
      </div>

      <div className="mt-4">
        <p>Status: {isLoaded ? "Ready" : "Not loaded"}</p>
        <p>Playing: {isPlaying ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}
