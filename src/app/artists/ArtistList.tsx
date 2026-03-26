"use client";

import Link from "next/link";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { api } from "~/trpc/react";

export const ArtistList = () => {
  const { data: artists, isLoading } = api.artists.getUserArtists.useQuery();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-12">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll py-4">
      {artists?.map((artist) => (
        <Link
          href={`/artists/${artist.id}`}
          key={artist.id}
          className="block w-full focus:outline-none"
        >
          <h3 className="overflow-hidden px-2 text-ellipsis whitespace-nowrap">
            {artist.name}
          </h3>
          <Separator className="my-2" />
        </Link>
      ))}
    </div>
  );
};
