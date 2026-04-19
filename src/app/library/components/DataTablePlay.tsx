"use client";

import Lottie from "lottie-react";
import { Play } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { play } from "~/app/_components/player/musicPlayerActions";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import SoundWave from "~/app/playlist/[id]/SoundWave.json";
import { Button } from "~/components/ui/button";
import { LIBRARY_PLAYLIST_ID } from "~/lib/constants";
import type { LibraryTrack } from "../DataTable";

export const DataTablePlay = ({ song }: { song: LibraryTrack }) => {
  const {
    currentPlaylistId,
    setCurrentPlaylist,
    setCurrentTrackIndex,
    currentTrack,
  } = useMusicPlayerStore(
    useShallow((s) => ({
      currentPlaylistId: s.currentPlaylistId,
      setCurrentPlaylist: s.setCurrentPlaylist,
      setCurrentTrackIndex: s.setCurrentTrackIndex,
      currentTrack: s.currentTrack,
    })),
  );

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
