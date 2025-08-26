"use client";

import { api } from "~/trpc/react";
import MainLayout from "~/app/MainLayout";

const Playlists = () => {
  const { data: playlists, isLoading } = api.playlists.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout>
      {playlists?.map((playlist) => {
        return (
          <div key={playlist.id}>
            <h3>{playlist.name}</h3>
            <p>{playlist.playlistEntries.length} songs</p>
          </div>
        );
      })}
    </MainLayout>
  );
};

export default Playlists;
