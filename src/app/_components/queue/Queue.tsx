"use client";

import { MinusIcon, QueueListIcon } from "@heroicons/react/24/solid";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

type QueueDrawerDirection = "bottom" | "right";

export const Queue = ({ direction }: { direction: QueueDrawerDirection }) => {
  const queue = useMusicPlayerStore((s) => s.queue);
  const clearQueue = useMusicPlayerStore((s) => s.clearQueue);
  const removeQueueItemAt = useMusicPlayerStore((s) => s.removeQueueItemAt);

  const tracks = queue ?? [];
  const hasItems = tracks.length > 0;

  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="Open queue"
          className="h-4 p-0!"
        >
          <QueueListIcon
            className={direction === "right" ? "size-4" : "size-5"}
            fill="#fff"
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex h-[50vh] flex-col md:h-auto">
        <div className="hidden">
          <DrawerTitle>queue</DrawerTitle>
        </div>
        <DrawerHeader className="border-border shrink-0 border-b pb-3 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">queue</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-xs"
              disabled={!hasItems}
              onClick={() => clearQueue()}
            >
              clear
            </Button>
          </div>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain px-4 pb-6">
          {!hasItems ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              nothing queued
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {tracks.map((track, index) => (
                <li
                  key={`${track.trackId}-${index}`}
                  className="flex items-start gap-2 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">{track.title}</p>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {track.artists
                        .map((artist) => artist.artistName)
                        .join(", ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive size-8 shrink-0"
                    aria-label={`Remove ${track.title} from queue`}
                    onClick={() => removeQueueItemAt(index)}
                  >
                    <MinusIcon className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
