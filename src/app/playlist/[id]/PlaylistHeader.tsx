"use client";
import { api } from "~/trpc/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "~/app/_components/ConfirmationDialog";

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
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

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
    <>
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
            onClick={() => setConfirmationDialogOpen(true)}
          >
            <Trash2 />
          </Button>
        )}
      </div>
      <ConfirmationDialog
        text="Are you sure you want to delete this playlist?"
        onConfirm={() => deletePlaylistMutation.mutate({ id: playlistId })}
        open={confirmationDialogOpen}
        onOpenChange={setConfirmationDialogOpen}
      />
    </>
  );
};
