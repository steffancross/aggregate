"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlaylistTrack } from "~/app/_components/player/types/player";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "~/components/ui/sheet";
import { api } from "~/trpc/react";
import { TrackForm, type AddTrackFormData } from "./TrackForm";

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
      album: data.album?.trim() || null,
      artworkUrl: data.artworkUrl || null,
    };

    editTrackMutation.mutate(processedData);
  };

  // Reset state when sheet closes
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="justify-center px-4">
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
            <div className="flex justify-center">
              <Button type="submit" form="track-form" variant="ghost">
                <ArrowRight />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
