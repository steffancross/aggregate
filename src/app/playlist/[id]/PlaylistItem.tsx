"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import type { PlaylistTrack } from "~/app/_components/player/types/player";
import { TrackOptions } from "~/app/_components/TrackOptions";
import Lottie from "lottie-react";
import SoundWave from "./SoundWave.json";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { play } from "~/app/_components/player/musicPlayerActions";

interface PlaylistItemProps {
  index: number;
  title: string;
  position: number;
  artists: { artistId: number; artistName: string }[];
  playlist: PlaylistTrack[];
  playlistId: number;
}

export const PlaylistItem = ({
  index,
  title,
  position,
  artists,
  playlist,
  playlistId,
}: PlaylistItemProps) => {
  const [hovered, setHovered] = useState(false);

  const {
    currentPlaylistId,
    currentTrackIndex,
    setCurrentPlaylist,
    setCurrentTrackIndex,
  } = useMusicPlayerStore(
    useShallow((s) => ({
      currentPlaylistId: s.currentPlaylistId,
      currentTrackIndex: s.currentTrackIndex,
      setCurrentPlaylist: s.setCurrentPlaylist,
      setCurrentTrackIndex: s.setCurrentTrackIndex,
    })),
  );

  const isCurrentTrack =
    currentPlaylistId === playlistId && currentTrackIndex === index;

  const handlePlay = async () => {
    if (currentPlaylistId !== playlistId) {
      setCurrentPlaylist(playlist, playlistId);
    }
    setCurrentTrackIndex(index);

    await play();
  };

  return (
    <div
      key={position}
      className={`flex w-full max-w-full flex-row items-center justify-between p-1 text-sm md:w-[70%]`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex min-w-0 flex-1 flex-row items-center gap-4"
        onClick={handlePlay}
      >
        <div className="flex w-8 shrink-0 items-center justify-center">
          {isCurrentTrack ? (
            <Lottie animationData={SoundWave} loop={true} />
          ) : hovered ? (
            <Play className="size-4" />
          ) : (
            <p>{index + 1}</p>
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="truncate">{title}</p>
          <p className="truncate">
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
        </div>
      </div>

      <TrackOptions song={playlist[index]!} />
    </div>
  );
};
