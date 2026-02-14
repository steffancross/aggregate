import { Drawer, DrawerContent, DrawerTitle } from "~/components/ui/drawer";
import { useMusicPlayer } from "~/app/_components/player/useMusicPlayer";
import {
  useMusicPlayerStore,
  useMusicPlayerComputed,
} from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { ProgressBar } from "~/app/_components/player/components/desktop/ProgressBar";

export const PlayerSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const isPlaying = useMusicPlayerStore((s) => s.isPlaying);

  const {
    play,
    pause,
    next,
    previous,
    handleProgressChange,
    handleProgressCommit,
  } = useMusicPlayer();

  const { currentTrack, hasNextTrack } = useMusicPlayerComputed();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent>
        <div className="hidden">
          <DrawerTitle>Player</DrawerTitle>
        </div>
        <div className="flex flex-col justify-between gap-4 px-4 py-8">
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
