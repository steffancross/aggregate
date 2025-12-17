"use client";

import { api } from "~/trpc/react";
import Link from "next/link";
import { Spinner } from "~/components/ui/spinner";

const Playlists = () => {
  const { data: playlists, isLoading } = api.playlists.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <>
      {playlists?.map((playlist) => {
        return (
          <Link
            href={`/playlist/${playlist.id}`}
            key={playlist.id}
            className="block focus:outline-none"
          >
            <h3>{playlist.name}</h3>
            <p>{playlist.playlistEntries.length} songs</p>
          </Link>
        );
      })}
    </>
  );
};

export default Playlists;
