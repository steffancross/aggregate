import {
  BackwardIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import { ArrowsCrossingIcon } from "@sidekickicons/react/24/solid";
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
import { Queue } from "~/app/_components/queue/Queue";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "~/components/ui/drawer";
import { Time } from "../desktop/Time";

export const PlayerSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);
  const isShuffleOn = useMusicPlayerStore((s) => s.isShuffleOn);
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);
  const currentTrack = useMusicPlayerStore((s) => s.currentTrack);
  const { hasNextTrack } = useMusicPlayerComputed();

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
            <div className="flex shrink-0 items-center gap-1">
              <Queue direction="bottom" />
              <Button
                variant="ghost"
                onClick={toggleShuffle}
                className={isShuffleOn ? "text-amber-600" : "text-primary"}
              >
                <ArrowsCrossingIcon className="size-5" />
              </Button>
            </div>
          </div>
          <div className="align-center flex justify-between">
            <Button
              variant="ghost"
              onClick={previous}
              disabled={!currentPlaylist}
            >
              <BackwardIcon className="size-5" fill="#fff" />
            </Button>
            <Button
              variant="ghost"
              onClick={isPlaying ? pause : play}
              disabled={!currentPlaylist}
            >
              {isPlaying ? (
                <PauseIcon className="size-8" fill="#fff" />
              ) : (
                <PlayIcon className="size-8" fill="#fff" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={next}
              disabled={!hasNextTrack || !currentPlaylist}
            >
              <ForwardIcon className="size-5" fill="#fff" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Time />
            <ProgressBar
              onProgressChange={handleProgressChange}
              onProgressCommit={handleProgressCommit}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
