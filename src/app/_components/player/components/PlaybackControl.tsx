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
      <Button
        onClick={onPrevious}
        className="px-4 py-2 text-white disabled:bg-gray-300"
      >
        <SkipBack className="h-4 w-4" />
      </Button>

      <Button
        onClick={isPlaying ? onPause : onPlay}
        className="bg-green-500 disabled:bg-gray-300"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <Button
        onClick={onNext}
        className="px-4 py-2 text-white disabled:bg-gray-300"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
};
