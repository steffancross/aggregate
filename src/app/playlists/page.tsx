"use client";

import { api } from "~/trpc/react";
import Link from "next/link";

const Playlists = () => {
  const { data: playlists, isLoading } = api.playlists.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {playlists?.map((playlist) => {
        return (
          <Link href={`/playlist/${playlist.id}`} key={playlist.id}>
            <h3>{playlist.name}</h3>
            <p>{playlist.playlistEntries.length} songs</p>
          </Link>
        );
      })}
    </>
  );
};

export default Playlists;
