"use client";

import Lottie from "lottie-react";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { reserveCurrentAndShuffleRest } from "~/app/_components/player/helpers/shuffleFunctions";
import { play } from "~/app/_components/player/musicPlayerActions";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import type { PlaylistTrack } from "~/app/_components/player/types/player";
import { TrackOptions } from "~/app/_components/TrackOptions";
import SoundWave from "./SoundWave.json";

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
  const [hovered, setHovered] = useState(false);

  const { currentPlaylistId, currentTrackIndex, currentPlaylist, isShuffleOn } =
    useMusicPlayerStore(
      useShallow((s) => ({
        currentPlaylistId: s.currentPlaylistId,
        currentTrackIndex: s.currentTrackIndex,
        currentPlaylist: s.currentPlaylist,
        isShuffleOn: s.isShuffleOn,
      })),
    );
  const { setCurrentPlaylist, setCurrentTrackIndex, setOriginalPlaylist } =
    useMusicPlayerStore.getState();

  const isCurrentTrack =
    currentPlaylistId === playlistId &&
    currentPlaylist![currentTrackIndex]!.trackId === trackId;

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
