"use client";
import { Pencil, Play, Shuffle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "~/app/_components/ConfirmationDialog";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import {
  fisherYatesShuffle,
  toggleShuffle,
} from "~/app/_components/player/helpers/shuffleFunctions";
import { play } from "~/app/_components/player/musicPlayerActions";
import type { PlaylistTrack } from "~/app/_components/player/types/player";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

export const PlaylistHeader = ({
  playlistId,
  playlistName,
  playlist,
}: {
  playlistId: number;
  playlistName: string;
  playlist: PlaylistTrack[];
}) => {
  const utils = api.useUtils();
  const router = useRouter();
  const { setCurrentPlaylist, setCurrentTrackIndex, setOriginalPlaylist } =
    useMusicPlayerStore.getState();
  const isShuffleOn = useMusicPlayerStore((s) => s.isShuffleOn);
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

  const handlePlay = async () => {
    setCurrentPlaylist(playlist, playlistId);
    setOriginalPlaylist(playlist);
    setCurrentTrackIndex(0);

    if (isShuffleOn) {
      const shuffledPlaylist = fisherYatesShuffle(playlist);
      setCurrentPlaylist(shuffledPlaylist, playlistId, {
        newTrackIndex: 0,
      });
    }

    await play();
  };

  return (
    <>
      <div className="mx-auto mt-8 mb-4 flex w-full max-w-120 flex-col gap-2">
        <div
          className="flex justify-between"
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
                className="rounded-full"
                onClick={() => setIsEditing(true)}
              >
                <Pencil />
              </Button>
              <Button
                size="icon"
                className="rounded-full"
                onClick={() => setConfirmationDialogOpen(true)}
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          {/* TODO */}
          <Button
            size="icon"
            className={isShuffleOn ? "bg-amber-600" : "bg-primary"}
            onClick={toggleShuffle}
          >
            <Shuffle />
          </Button>
          <Button size="icon" onClick={handlePlay}>
            <Play />
          </Button>
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
