import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface PlaybackControlProps {
  onPlay: () => void;
  onPause: () => void;
}

export const PlayPause = ({ onPlay, onPause }: PlaybackControlProps) => {
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);

  return (
    <Button
      disabled={!currentPlaylist}
      onClick={isPlaying ? onPause : onPlay}
      variant="ghost"
      className={cn("h-4 p-0!")}
    >
      {isPlaying ? (
        <PauseIcon className="size-4" fill="#fff" />
      ) : (
        <PlayIcon className="size-4" fill="#fff" />
      )}
    </Button>
  );
};
