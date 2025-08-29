"use client";

import { api } from "~/trpc/react";

const Playlists = () => {
  const { data: playlists, isLoading } = api.playlists.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {playlists?.map((playlist) => {
        return (
          <div key={playlist.id}>
            <h3>{playlist.name}</h3>
            <p>{playlist.playlistEntries.length} songs</p>
          </div>
        );
      })}
    </>
  );
};

export default Playlists;
