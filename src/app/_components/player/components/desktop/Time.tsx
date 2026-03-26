import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { formatSongTime } from "~/lib/utils";

export const Time = () => {
  const currentTime = useMusicPlayerStore((s) => s.currentTime);
  const duration = useMusicPlayerStore((s) => s.duration);

  return (
    <div className="flex gap-1.5 text-sm tabular-nums">
      <p>{formatSongTime(currentTime)}</p>
      <p>{formatSongTime(duration)}</p>
    </div>
  );
};
