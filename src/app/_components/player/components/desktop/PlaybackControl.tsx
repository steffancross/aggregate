import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import { ArrowsCrossingIcon } from "@sidekickicons/react/24/solid";

import { toggleShuffle } from "~/app/_components/player/helpers/shuffleFunctions";
import {
  useMusicPlayerComputed,
  useMusicPlayerStore,
} from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface PlaybackControlProps {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const PlaybackControl = ({
  onPlay,
  onPause,
  onNext,
  onPrevious,
}: PlaybackControlProps) => {
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const isShuffleOn = useMusicPlayerStore((s) => s.isShuffleOn);
  const { hasNextTrack } = useMusicPlayerComputed();

  return (
    <div className="flex flex-row">
      <Button
        onClick={toggleShuffle}
        variant="ghost"
        className={cn("px-2!", isShuffleOn ? "text-amber-600" : "text-primary")}
      >
        <ArrowsCrossingIcon />
      </Button>
      <Button onClick={onPrevious} variant="ghost" className="px-2!">
        <BackwardIcon className="size-5" fill="#fff" />
      </Button>

      <Button
        onClick={isPlaying ? onPause : onPlay}
        variant="ghost"
        size="icon"
      >
        {isPlaying ? (
          <PauseIcon className="size-7" fill="#fff" />
        ) : (
          <PlayIcon className="size-7" fill="#fff" />
        )}
      </Button>

      <Button
        onClick={onNext}
        variant="ghost"
        disabled={!hasNextTrack}
        className="px-2!"
      >
        <ForwardIcon className="size-5" fill="#fff" />
      </Button>
    </div>
  );
};
