import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { Slider } from "~/components/ui/slider";

interface ProgressBarProps {
  onProgressChange: (value: number[]) => void;
  onProgressCommit: (value: number[]) => void;
}

export const ProgressBar = ({
  onProgressChange,
  onProgressCommit,
}: ProgressBarProps) => {
  const currentTime = useMusicPlayerStore((s) => s.currentTime);
  const duration = useMusicPlayerStore((s) => s.duration);

  return (
    <Slider
      value={[currentTime]}
      onValueChange={onProgressChange}
      onValueCommit={onProgressCommit}
      max={duration > 0 ? duration : 1}
      step={1}
      thumbClassName="hidden"
      trackClassName="rounded-none"
    />
  );
};
