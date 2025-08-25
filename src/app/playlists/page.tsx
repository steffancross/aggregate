"use client";

import { api } from "~/trpc/react";

const Playlists = () => {
  const playlists = api.playlists.getAll.useQuery();

  console.log(playlists.data);

  return (
    <>
      {playlists.data?.map((playlist) => {
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
