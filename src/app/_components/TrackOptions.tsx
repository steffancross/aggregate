"use client";

import { Ellipsis } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "~/components/ui/dropdown-menu";

import { EditTrack } from "./forms/EditTrack";
import { useState, useEffect } from "react";

import type { PlaylistTrack } from "./player/types/player";
import { PlaylistSelector } from "./forms/PlaylistSelector";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const TrackOptions = ({ song }: { song: PlaylistTrack }) => {
  const utils = api.useUtils();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);

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
    </>
  );
};
