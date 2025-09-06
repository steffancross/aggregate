"use client";

import { useState } from "react";
import { Ellipsis, Play } from "lucide-react";

interface PlaylistItemProps {
  index: number;
  title: string;
  position: number;
  artists: { artistId: number; artistName: string }[];
}

export const PlaylistItem = ({
  index,
  title,
  position,
  artists,
}: PlaylistItemProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      key={position}
      className="flex w-7/10 flex-row items-center justify-between border border-blue-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-row items-center gap-4">
        {hovered ? <Play /> : <p>{index + 1}</p>}
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
