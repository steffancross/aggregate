"use client";

import { Card } from "~/components/ui/card";
import { useState } from "react";
import { useMusicPlayer } from "~/app/_components/player/useMusicPlayer";
import {
  useMusicPlayerStore,
  useMusicPlayerComputed,
} from "~/app/_components/player/MusicPlayerStore";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { Play, Pause } from "lucide-react";
import { PlayerSheet } from "./PlayerSheet";
import { useShallow } from "zustand/react/shallow";

export const PlayerCard = () => {
  const [open, setOpen] = useState(false);
  const { loadedOnce, isPlaying, duration, currentTime } = useMusicPlayerStore(
    useShallow((s) => ({
      loadedOnce: s.loadedOnce,
      isPlaying: s.isPlaying,
      duration: s.duration,
      currentTime: s.currentTime,
    })),
  );

  const { play, pause } = useMusicPlayer();
  const { currentTrack } = useMusicPlayerComputed();

  if (!loadedOnce) return null;

  return (
    <>
      <Card
        className="position: fixed bottom-0 w-full rounded-none p-0"
        onClick={() => setOpen(true)}
      >
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
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                if (isPlaying) {
                  await pause();
                } else {
                  await play();
                }
              }}
              variant="ghost"
            >
              {isPlaying ? (
                <Pause fill="#fff" className="size-5" />
              ) : (
                <Play fill="#fff" className="size-5" />
              )}
            </Button>
          </div>

          <Progress
            value={(currentTime / duration) * 100}
            className="rounded-none"
          />
        </div>
      </Card>
      <PlayerSheet open={open} onOpenChange={setOpen} />
    </>
  );
};
