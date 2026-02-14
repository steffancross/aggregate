import { Slider } from "~/components/ui/slider";
import { formatSongTime } from "~/lib/utils";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";

interface ProgressBarProps {
  onProgressChange: (value: number[]) => void;
  onProgressCommit: (value: number[]) => void;
  location?: "desktop" | "mobile";
}

export const ProgressBar = ({
  onProgressChange,
  onProgressCommit,
  location = "desktop",
}: ProgressBarProps) => {
  const currentTime = useMusicPlayerStore((s) => s.currentTime);
  const duration = useMusicPlayerStore((s) => s.duration);

  return (
    <div
      className={
        location === "desktop"
          ? "flex flex-row items-center gap-4"
          : "flex flex-col-reverse"
      }
    >
      <Slider
        value={[currentTime]}
        onValueChange={onProgressChange}
        onValueCommit={onProgressCommit}
        max={duration}
        step={1}
        className={location === "desktop" ? "w-80" : "w-full"}
        thumbClassName="hidden"
      />

      <span className="flex w-26 justify-center">
        {formatSongTime(currentTime)} / {formatSongTime(duration)}
      </span>
    </div>
  );
};
