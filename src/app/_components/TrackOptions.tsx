"use client";

import { Ellipsis } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useEffect, useState } from "react";
import { EditTrack } from "./forms/EditTrack";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { PlaylistSelector } from "./forms/PlaylistSelector";
import { useMusicPlayerStore } from "./player/MusicPlayerStore";
import type { PlaylistTrack } from "./player/types/player";

export const TrackOptions = ({ song }: { song: PlaylistTrack }) => {
  const utils = api.useUtils();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const enqueueTrack = useMusicPlayerStore((s) => s.enqueueTrack);

  const { data: trackPlaylists } = api.tracks.getTrackPlaylists.useQuery(
    {
      trackId: song.trackId,
    },
    {
      enabled: popoverOpen,
    },
  );
  const { data: playlists } = api.playlists.getAll.useQuery();
  const formattedPlaylists = playlists?.map((playlist) => ({
    value: playlist.id,
    label: playlist.name,
  }));

  const updateTrackPlaylistsMutation =
    api.playlists.updateTrackPlaylists.useMutation({
      onSuccess: async () => {
        await utils.tracks.getTrackPlaylists.invalidate({
          trackId: song.trackId,
        });
        await utils.playlists.getAll.invalidate();
        await utils.playlists.getById.invalidate({ id: song.playlistId });
        router.refresh();
        toast.success("Song playlists updated");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Error updating song playlists");
      },
    });

  const deleteTrackMutation = api.tracks.deleteTrack.useMutation({
    onSuccess: async () => {
      await utils.tracks.getTrackPlaylists.invalidate({
        trackId: song.trackId,
      });
      await utils.playlists.getAll.invalidate();
      await utils.playlists.getById.invalidate({ id: song.playlistId });
      router.refresh();
      toast.success("Song deleted");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error deleting song");
    },
  });

  useEffect(() => {
    if (trackPlaylists) {
      setSelectedPlaylists(trackPlaylists);
    }
  }, [trackPlaylists]);

  const handleUpdateTrackPlaylists = (playlistIds: number[]) => {
    setSelectedPlaylists(playlistIds);
    updateTrackPlaylistsMutation.mutate({
      trackId: song.trackId,
      playlistIds: playlistIds,
    });
  };

  return (
    <>
      <DropdownMenu open={popoverOpen} onOpenChange={setPopoverOpen}>
        <DropdownMenuTrigger>
          <Ellipsis className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-2">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            edit song
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => enqueueTrack(song)}>
            add to queue
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setConfirmationDialogOpen(true)}
            className="text-red-500 hover:text-red-500!"
          >
            delete song
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {song.sourceUrl && (
            <>
              <DropdownMenuItem asChild>
                <a
                  href={song.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  go to source
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>playlists</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <PlaylistSelector
                  options={formattedPlaylists ?? []}
                  selected={selectedPlaylists}
                  onChange={(selectedPlaylists) => {
                    handleUpdateTrackPlaylists(selectedPlaylists);
                  }}
                  className="mt-2"
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      {open && <EditTrack open={open} onOpenChange={setOpen} song={song} />}
      <ConfirmationDialog
        text="Are you sure you want to delete this song? It will be removed from your library and all playlists."
        onConfirm={() => deleteTrackMutation.mutate({ id: song.trackId })}
        open={confirmationDialogOpen}
        onOpenChange={setConfirmationDialogOpen}
      />
    </>
  );
};
