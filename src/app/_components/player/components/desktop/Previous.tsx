import { BackwardIcon } from "@heroicons/react/24/solid";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const Previous = ({ onPrevious }: { onPrevious: () => void }) => {
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);

  return (
    <Button
      disabled={!currentPlaylist}
      onClick={onPrevious}
      variant="ghost"
      className={cn("h-4 p-0!")}
    >
      <BackwardIcon className="size-5" fill="#fff" />
    </Button>
  );
};
