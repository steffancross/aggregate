"use client";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "~/app/_components/ConfirmationDialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

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
  const [currentPlaylistName, setCurrentPlaylistName] = useState(playlistName);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const updatePlaylistMutation = api.playlists.updatePlaylist.useMutation({
    onSuccess: async () => {
      await utils.playlists.getAll.invalidate();
      toast.success("Playlist updated");
    },
    onError: () => {
      toast.error("Error updating playlist");
    },
  });

  const deletePlaylistMutation = api.playlists.deletePlaylist.useMutation({
    onSuccess: async () => {
      await utils.playlists.getAll.invalidate();
      router.push("/playlists");
      toast.success("Playlist deleted");
    },
    onError: () => {
      toast.error("Error deleting playlist");
    },
  });

  const handleUpdatePlaylistName = (name: string) => {
    updatePlaylistMutation.mutate({ id: playlistId, name: name });
    setCurrentPlaylistName(name);
    setIsEditing(false);
  };

  return (
    <>
      <div className="w-full">
        <div
          className="items-top flex min-h-10 justify-between"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {isEditing ? (
            <Input
              defaultValue={currentPlaylistName}
              onBlur={(e) => handleUpdatePlaylistName(e.target.value)}
            />
          ) : (
            <h1>{currentPlaylistName}</h1>
          )}
          {hovered && !isEditing && (
            <div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => setIsEditing(true)}
              >
                <PencilSquareIcon />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => setConfirmationDialogOpen(true)}
              >
                <XMarkIcon />
              </Button>
            </div>
          )}
        </div>
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
