"use client";

import { Card } from "~/components/ui/card";
import { useMusicPlayer } from "~/app/_components/player/useMusicPlayer";
import {
  useMusicPlayerStore,
  useMusicPlayerComputed,
} from "~/app/_components/player/MusicPlayerStore";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { Play, Pause } from "lucide-react";

export const PlayerCard = () => {
  const { loadedOnce, isPlaying, duration, currentTime } =
    useMusicPlayerStore();

  const { play, pause } = useMusicPlayer();

  const { currentTrack } = useMusicPlayerComputed();

  if (!loadedOnce) return null;

  return (
    <Card className="position: fixed bottom-0 w-full rounded-none p-0">
      <div className="flex h-full flex-col">
        <div className="flex flex-row items-center justify-between px-6 py-3">
          <div>
            <p className="line-clamp-1 truncate font-semibold">
              {currentTrack?.title}
            </p>
            <p className="text-muted-foreground line-clamp-1 truncate text-sm">
              {currentTrack?.artists
                .map((artist) => artist.artistName)
                .join(", ")}
            </p>
          </div>
          <Button onClick={isPlaying ? pause : play} variant="ghost">
            {isPlaying ? (
              <Pause fill="#fff" size={20} />
            ) : (
              <Play fill="#fff" size={30} />
            )}
          </Button>
        </div>

        <Progress
          value={(currentTime / duration) * 100}
          className="rounded-none"
        />
      </div>
    </Card>
  );
};
