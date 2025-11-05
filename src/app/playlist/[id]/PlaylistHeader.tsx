"use client";
import { api } from "~/trpc/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const PlaylistHeader = ({
  playlistId,
  playlistName,
}: {
  playlistId: number;
  playlistName: string;
}) => {
  const utils = api.useUtils();
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const deletePlaylistMutation = api.playlists.deletePlaylist.useMutation({
    onSuccess: async () => {
      await utils.playlists.getAll.invalidate();
      router.push("/playlists");
    },
    onError: () => {
      //TODO: toast
    },
  });

  return (
    <div
      className="flex w-120 items-center justify-between"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h1 className="mt-7">{playlistName}</h1>
      {hovered && (
        <Button
          size="icon"
          className="rounded-full"
          onClick={() => deletePlaylistMutation.mutate({ id: playlistId })}
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
};
