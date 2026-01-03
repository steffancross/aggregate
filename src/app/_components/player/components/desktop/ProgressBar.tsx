import { Slider } from "~/components/ui/slider";
import { formatSongTime } from "~/lib/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onProgressChange: (value: number[]) => void;
  onProgressCommit: (value: number[]) => void;
}

export const ProgressBar = ({
  currentTime,
  duration,
  onProgressChange,
  onProgressCommit,
}: ProgressBarProps) => {
  return (
    <div className="flex flex-row items-center gap-4">
      <Slider
        value={[currentTime]}
        onValueChange={onProgressChange}
        onValueCommit={onProgressCommit}
        max={duration}
        step={1}
        className="w-100"
        thumbClassName="hidden"
      />

      <span className="w-24">
        {formatSongTime(currentTime)} / {formatSongTime(duration)}
      </span>
    </div>
  );
};
