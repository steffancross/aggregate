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
    <>
      <Slider
        value={[currentTime]}
        onValueChange={onProgressChange}
        onValueCommit={onProgressCommit}
        max={duration}
        step={1}
        className="w-100"
      />

      <span className="w-24">
        {formatSongTime(currentTime)} / {formatSongTime(duration)}
      </span>
    </>
  );
};
