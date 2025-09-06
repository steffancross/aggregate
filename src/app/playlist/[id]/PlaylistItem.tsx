"use client";

import { useState } from "react";
import { Ellipsis, Play } from "lucide-react";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { useMusicPlayer } from "~/app/_components/player/useMusicPlayer";
import type { PlaylistTrack } from "~/app/_components/player/types/player";
import { Button } from "~/components/ui/button";

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
  } = useMusicPlayerStore();

  const { play } = useMusicPlayer();

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
      className={`flex w-7/10 flex-row items-center justify-between ${isCurrentTrack ? "border-green-500 bg-green-50" : "border-blue-500"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-row items-center gap-4">
        {hovered ? (
          <Button onClick={handlePlay}>
            <Play />
          </Button>
        ) : (
          <p>{index + 1}</p>
        )}
        <div className="flex flex-col">
          <p>{title}</p>
          <p>{artists.map((artist) => artist.artistName).join(", ")}</p>
        </div>
      </div>
      <div className="flex flex-row">
        <Ellipsis />
      </div>
    </div>
  );
};
