"use client";

import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { reserveCurrentAndShuffleRest } from "~/app/_components/player/helpers/shuffleFunctions";
import { play } from "~/app/_components/player/musicPlayerActions";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import type { PlaylistTrack } from "~/app/_components/player/types/player";
import { TrackOptions } from "~/app/_components/TrackOptions";
import { cn } from "~/lib/utils";

interface PlaylistItemProps {
  index: number;
  title: string;
  position: number;
  artists: { artistId: number; artistName: string }[];
  playlist: PlaylistTrack[];
  playlistId: number;
  trackId: number;
}

export const PlaylistItem = ({
  index,
  title,
  position,
  artists,
  playlist,
  playlistId,
  trackId,
}: PlaylistItemProps) => {
  const { currentPlaylistId, isShuffleOn, currentTrack } = useMusicPlayerStore(
    useShallow((s) => ({
      currentPlaylistId: s.currentPlaylistId,
      isShuffleOn: s.isShuffleOn,
      currentTrack: s.currentTrack,
    })),
  );
  const { setCurrentPlaylist, setCurrentTrackIndex, setOriginalPlaylist } =
    useMusicPlayerStore.getState();

  const isCurrentTrack =
    currentPlaylistId === playlistId && currentTrack?.trackId === trackId;

  const handlePlay = async () => {
    setCurrentPlaylist(playlist, playlistId);
    setOriginalPlaylist(playlist);
    setCurrentTrackIndex(index);

    if (isShuffleOn) {
      const shuffledPlaylist = reserveCurrentAndShuffleRest();
      setCurrentPlaylist(shuffledPlaylist, playlistId, {
        newTrackIndex: 0,
      });
    }

    await play();
  };

  return (
    <div
      key={position}
      className={cn(
        "md:hover:bg-accent grid w-full grid-cols-[1fr_1fr_auto] items-center text-sm md:grid-cols-[3fr_2fr_auto]",
      )}
      onClick={handlePlay}
    >
      <p
        className={cn(
          "truncate",
          isCurrentTrack ? "font-semibold text-amber-700" : "",
        )}
      >
        {title}
      </p>

      <p
        className={cn(
          "truncate pr-6 text-end md:text-start",
          isCurrentTrack ? "font-semibold" : "",
        )}
      >
        {artists.map((artist, index) => {
          return (
            <Link
              href={`/artists/${artist.artistId}`}
              key={artist.artistId}
              className="text-muted-foreground hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {artist.artistName}
              {index < artists.length - 1 && ", "}
            </Link>
          );
        })}
      </p>

      <div onClick={(e) => e.stopPropagation()}>
        <TrackOptions song={playlist[index]!} />
      </div>
    </div>
  );
};
