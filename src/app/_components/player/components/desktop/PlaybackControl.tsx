import { Button } from "~/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import {
  useMusicPlayerStore,
  useMusicPlayerComputed,
} from "~/app/_components/player/MusicPlayerStore";

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
  const { hasNextTrack } = useMusicPlayerComputed();

  return (
    <div className="flex flex-row gap-2">
      <Button onClick={onPrevious} variant="ghost">
        <SkipBack className="h-4 w-4" fill="#fff" />
      </Button>

      <Button
        onClick={isPlaying ? onPause : onPlay}
        variant="ghost"
        size="icon"
      >
        {isPlaying ? (
          <Pause className="size-6" fill="#fff" />
        ) : (
          <Play fill="#fff" className="size-6" />
        )}
      </Button>

      <Button onClick={onNext} variant="ghost" disabled={!hasNextTrack}>
        <SkipForward className="h-4 w-4" fill="#fff" />
      </Button>
    </div>
  );
};
