"use client";

import type { LibraryTrack } from "../DataTable";
import { Play } from "lucide-react";
import {
  useMusicPlayerStore,
  useMusicPlayerComputed,
} from "~/app/_components/player/MusicPlayerStore";
import { useMusicPlayer } from "~/app/_components/player/useMusicPlayer";
import { Button } from "~/components/ui/button";
import Lottie from "lottie-react";
import SoundWave from "~/app/playlist/[id]/SoundWave.json";
import { useShallow } from "zustand/react/shallow";

export const DataTablePlay = ({ song }: { song: LibraryTrack }) => {
  const { currentPlaylistId, setCurrentPlaylist, setCurrentTrackIndex } =
    useMusicPlayerStore(
      useShallow((s) => ({
        currentPlaylistId: s.currentPlaylistId,
        setCurrentPlaylist: s.setCurrentPlaylist,
        setCurrentTrackIndex: s.setCurrentTrackIndex,
      })),
    );

  const { currentTrack } = useMusicPlayerComputed();
  const { play } = useMusicPlayer();
  const LIBRARY_PLAYLIST_ID = -1;

  const isCurrentTrack =
    currentPlaylistId === LIBRARY_PLAYLIST_ID &&
    currentTrack?.trackId === song.trackId;

  const handlePlay = async () => {
    if (
      currentPlaylistId !== LIBRARY_PLAYLIST_ID ||
      currentTrack?.trackId !== song.trackId
    ) {
      setCurrentPlaylist([song], LIBRARY_PLAYLIST_ID);
    }
    setCurrentTrackIndex(0);

    await play();
  };

  return (
    <div className="flex h-8 w-8 items-center justify-center">
      {isCurrentTrack ? (
        <Lottie animationData={SoundWave} loop={true} />
      ) : (
        <Button
          onClick={handlePlay}
          size="icon"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 dark:hover:bg-transparent"
        >
          <Play />
        </Button>
      )}
    </div>
  );
};
