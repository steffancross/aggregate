import { ForwardIcon } from "@heroicons/react/24/solid";
import {
  useMusicPlayerComputed,
  useMusicPlayerStore,
} from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const Next = ({ onNext }: { onNext: () => void }) => {
  const { hasNextTrack } = useMusicPlayerComputed();
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);

  return (
    <Button
      onClick={onNext}
      variant="ghost"
      disabled={!hasNextTrack || !currentPlaylist}
      className={cn("h-4 p-0!")}
    >
      <ForwardIcon className="size-5" fill="#fff" />
    </Button>
  );
};
