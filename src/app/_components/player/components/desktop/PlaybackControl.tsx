import { Button } from "~/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

interface PlaybackControlProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const PlaybackControl = ({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
}: PlaybackControlProps) => {
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

      <Button onClick={onNext} variant="ghost">
        <SkipForward className="h-4 w-4" fill="#fff" />
      </Button>
    </div>
  );
};
