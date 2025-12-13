"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { TrackForm } from "./TrackForm";
import { api } from "~/trpc/react";
import { type AddTrackFormData } from "./TrackForm";
import type { PlaylistTrack } from "~/app/_components/player/types/player";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export const EditTrack = ({
  open,
  onOpenChange,
  song,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: PlaylistTrack;
}) => {
  const router = useRouter();
  const utils = api.useUtils();
  const { data } = api.artists.getAll.useQuery();

  const initialData = {
    id: song.trackId,
    title: song.title,
    artist: song.artists.map((artist) => artist.artistName),
    album: song.album ?? "",
    source: song.source,
    sourceId: song.sourceId ?? "",
    sourceUrl: song.sourceUrl ?? "",
    artworkUrl: song.artworkUrl ?? "",
    duration: song.duration ?? 0,
  };

  const editTrackMutation = api.tracks.updateTrack.useMutation({
    onSuccess: async () => {
      onOpenChange(false);
      await utils.playlists.getById.invalidate({ id: song.playlistId });
      await utils.playlists.getAll.invalidate();
      router.refresh();
      toast.success("Song updated");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error updating song");
    },
  });

  const handleSubmit = async (data: AddTrackFormData) => {
    const processedData = {
      id: song.trackId,
      title: data.title,
      artist: data.artist,
      album: data.album?.trim() || undefined,
    };

    editTrackMutation.mutate(processedData);
  };

  // Reset state when sheet closes
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <div className="hidden">
          <SheetTitle>Edit Song</SheetTitle>
          <SheetDescription>Edit a song in your library.</SheetDescription>
        </div>
        {initialData && (
          <>
            <TrackForm
              initialData={initialData}
              onSubmit={handleSubmit}
              mode="edit"
              artists={data ?? []}
            />
            <Button type="submit" form="track-form">
              Submit
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
