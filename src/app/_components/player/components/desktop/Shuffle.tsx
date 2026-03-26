import { ArrowsCrossingIcon } from "@sidekickicons/react/24/solid";
import { toggleShuffle } from "~/app/_components/player/helpers/shuffleFunctions";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const Shuffle = () => {
  const isShuffleOn = useMusicPlayerStore((s) => s.isShuffleOn);

  return (
    <Button
      onClick={toggleShuffle}
      variant="ghost"
      className={cn(
        "h-4 px-0!",
        isShuffleOn ? "text-amber-600" : "text-primary",
      )}
    >
      <ArrowsCrossingIcon fill="#fff" />
    </Button>
  );
};
