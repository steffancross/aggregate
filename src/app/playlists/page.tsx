"use client";

import Link from "next/link";
import { Spinner } from "~/components/ui/spinner";
import { api } from "~/trpc/react";

const Playlists = () => {
  const { data: playlists, isLoading } = api.playlists.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="grid flex-1 place-items-center">
          <Spinner className="size-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {playlists?.map((playlist) => {
          return (
            <Link
              href={`/playlist/${playlist.id}`}
              key={playlist.id}
              className="block w-full focus:outline-none"
            >
              <h3 className="overflow-hidden text-[clamp(2rem,8vw,8rem)] leading-none font-bold text-ellipsis whitespace-nowrap">
                {playlist.name}
              </h3>
              <p className="text-right opacity-70">
                {playlist.playlistEntries.length} songs
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Playlists;
