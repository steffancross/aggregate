import { ArrowsCrossingIcon } from "@sidekickicons/react/24/solid";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { ProgressBar } from "~/app/_components/player/components/desktop/ProgressBar";
import { toggleShuffle } from "~/app/_components/player/helpers/shuffleFunctions";
import {
  handleProgressChange,
  handleProgressCommit,
  next,
  pause,
  play,
  previous,
} from "~/app/_components/player/musicPlayerActions";
import {
  useMusicPlayerComputed,
  useMusicPlayerStore,
} from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "~/components/ui/drawer";

export const PlayerSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const isShuffleOn = useMusicPlayerStore((s) => s.isShuffleOn);

  const { currentTrack, hasNextTrack } = useMusicPlayerComputed();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent>
        <div className="hidden">
          <DrawerTitle>Player</DrawerTitle>
        </div>
        <div className="flex flex-col justify-between gap-4 px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="line-clamp-1 truncate font-semibold">
                {currentTrack?.title}
              </p>
              <p className="text-muted-foreground line-clamp-1 truncate text-sm">
                {currentTrack?.artists
                  .map((artist) => artist.artistName)
                  .join(", ")}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={toggleShuffle}
              className={isShuffleOn ? "text-amber-600" : "text-primary"}
            >
              <ArrowsCrossingIcon className="size-5" />
            </Button>
          </div>
          <div className="align-center flex justify-between">
            <Button variant="ghost" onClick={previous}>
              <SkipBack className="size-5" fill="#fff" />
            </Button>
            <Button variant="ghost" onClick={isPlaying ? pause : play}>
              {isPlaying ? (
                <Pause className="size-5" fill="#fff" />
              ) : (
                <Play className="size-5" fill="#fff" />
              )}
            </Button>
            <Button variant="ghost" onClick={next} disabled={!hasNextTrack}>
              <SkipForward className="size-5" fill="#fff" />
            </Button>
          </div>
          <div>
            <ProgressBar
              onProgressChange={handleProgressChange}
              onProgressCommit={handleProgressCommit}
              location="mobile"
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
