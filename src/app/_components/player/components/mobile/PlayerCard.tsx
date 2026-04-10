"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { pause, play } from "~/app/_components/player/musicPlayerActions";
import {
  useMusicPlayerComputed,
  useMusicPlayerStore,
} from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { PlayerSheet } from "./PlayerSheet";

export const PlayerCard = () => {
  const [open, setOpen] = useState(false);
  const { loadedOnce, isPlaying, duration, currentTime, currentPlaylist } =
    useMusicPlayerStore(
      useShallow((s) => ({
        loadedOnce: s.loadedOnce,
        isPlaying: s.isPlaying,
        duration: s.duration,
        currentTime: s.currentTime,
        currentPlaylist: s.currentPlaylist,
      })),
    );

  const { currentTrack } = useMusicPlayerComputed();

  if (!loadedOnce) return null;

  return (
    <>
      {currentPlaylist && (
        <Card className="w-full rounded-none p-0" onClick={() => setOpen(true)}>
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
                disabled={!currentPlaylist}
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
                  <PauseIcon className="size-5" fill="#fff" />
                ) : (
                  <PlayIcon className="size-5" fill="#fff" />
                )}
              </Button>
            </div>

            <Progress
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
              className="rounded-none"
            />
          </div>
        </Card>
      )}
      <PlayerSheet open={open} onOpenChange={setOpen} />
    </>
  );
};
