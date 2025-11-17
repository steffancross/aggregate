"use client";

import { Ellipsis } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { EditTrack } from "./forms/EditTrack";
import { useState, useEffect } from "react";
import { Separator } from "~/components/ui/separator";
import type { PlaylistTrack } from "./player/types/player";
import { PlaylistSelector } from "./forms/PlaylistSelector";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

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
      },
      onError: (error) => {
        console.error(error);
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
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger>
          <Ellipsis className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent>
          <div onClick={() => setOpen(true)}>Edit</div>
          <Separator />
          <PlaylistSelector
            options={formattedPlaylists ?? []}
            selected={selectedPlaylists}
            onChange={(selectedPlaylists) => {
              handleUpdateTrackPlaylists(selectedPlaylists);
            }}
          />
        </PopoverContent>
      </Popover>
      {open && <EditTrack open={open} onOpenChange={setOpen} song={song} />}
    </>
  );
};
