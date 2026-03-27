"use client";

import { useUser } from "@clerk/nextjs";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { useMusicPlayerComputed } from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import {
  handleProgressChange,
  handleProgressCommit,
  handleVolumeChange,
  next,
  pause,
  play,
  previous,
} from "../../musicPlayerActions";
import { Next } from "./Next";
import { PlayPause } from "./PlayPause";
import { Previous } from "./Previous";
import { ProgressBar } from "./ProgressBar";
import { Shuffle } from "./Shuffle";
import { Time } from "./Time";
import { VolumeControl } from "./VolumeControl";

export const MusicPlayer = () => {
  const { currentTrack } = useMusicPlayerComputed();
  const { isSignedIn } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="m-2 border border-amber-50 p-4">
      <div className="grid w-full grid-cols-[auto_1fr_auto] items-center">
        {/* row 1 */}
        <div className="justify-self-start">
          <PlayPause onPlay={play} onPause={pause} />
        </div>

        <p className="line-clamp-1 text-center text-xs font-semibold">
          {currentTrack?.title}
        </p>

        <div className="justify-self-end">
          <VolumeControl onVolumeChange={handleVolumeChange} />
        </div>

        {/* row 2 */}
        <div className="justify-self-start">
          <Time />
        </div>

        <p className="text-muted-foreground line-clamp-1 text-center text-xs">
          {currentTrack?.artists.map((artist) => artist.artistName).join(", ")}
        </p>

        <div className="justify-self-end">
          <div className="flex items-center gap-2">
            <Previous onPrevious={previous} />
            <span className="text-muted-foreground text-xs">/</span>
            <Next onNext={next} />
            <span className="text-muted-foreground text-xs">/</span>
            <Shuffle />
            <span className="text-muted-foreground text-xs">/</span>
            <Button
              variant="ghost"
              className="h-4 p-0!"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ArrowsPointingOutIcon className="size-4" fill="#fff" />
              ) : (
                <ArrowsPointingInIcon className="size-4" fill="#fff" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2">
          <ProgressBar
            onProgressChange={handleProgressChange}
            onProgressCommit={handleProgressCommit}
          />
        </div>
      )}
    </div>
  );
};
