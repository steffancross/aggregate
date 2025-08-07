"use client";

import { useEffect, useState } from "react";
import { SoundCloudAdapter } from "./player/adapters/SoundCloudAdapter";

export default function TestPlayer() {
  const [adapter, setAdapter] = useState<SoundCloudAdapter | null>(null);
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
      const newAdapter = new SoundCloudAdapter("test-player");
      await newAdapter.loadTrack(
        "https://soundcloud.com/evens/evens-year-walk-free-download",
      );
      setAdapter(newAdapter);
      setIsLoaded(true);
      console.log("Track loaded successfully!");
    } catch (error) {
      console.error("Failed to load track:", error);
    }
  };

  const play = () => {
    if (adapter && isLoaded) {
      adapter.play();
      setIsPlaying(true);
      console.log("Play called");
    }
  };

  const pause = () => {
    if (adapter && isLoaded) {
      adapter.pause();
      setIsPlaying(false);
      console.log("Pause called");
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
