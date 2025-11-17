"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { LinkStep } from "./LinkStep";
import { TrackForm } from "./TrackForm";
import { api } from "~/trpc/react";
import { type TrackData } from "~/lib/actions/getTrackData";
import { type AddTrackFormData } from "./TrackForm";
import { PlaylistSelector } from "./PlaylistSelector";
import { Button } from "~/components/ui/button";

export const AddTrack = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const utils = api.useUtils();
  const [currentStep, setCurrentStep] = useState(1);
  const [fetchedData, setFetchedData] = useState<TrackData | null>(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);
  const { data: artists } = api.artists.getAll.useQuery();

  const { data: playlists } = api.playlists.getAll.useQuery();
  const formattedPlaylists = playlists?.map((playlist) => ({
    value: playlist.id,
    label: playlist.name,
  }));

  const updatePlaylistsMutation =
    api.playlists.updateTrackPlaylists.useMutation({
      onSuccess: async () => {
        await utils.playlists.getAll.invalidate();
        for (const playlistId of selectedPlaylists) {
          await utils.playlists.getById.invalidate({ id: playlistId });
        }
      },
      onError: (error) => {
        console.error(error);
      },
    });

  const addTrackMutation = api.tracks.addTrack.useMutation({
    //TODO: toast
    onSuccess: (libraryTrack) => {
      if (selectedPlaylists.length > 0) {
        updatePlaylistsMutation.mutate({
          trackId: libraryTrack.id,
          playlistIds: selectedPlaylists,
        });
      }

      setCurrentStep(1);
      setFetchedData(null);
      setSelectedPlaylists([]);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleStep1Next = (data: TrackData) => {
    setFetchedData(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: AddTrackFormData) => {
    const processedData = {
      title: data.title,
      artist: data.artist.filter((name) => name.trim() !== ""), // Remove empty artist names
      album: data.album?.trim() || undefined,
      source: data.source,
      sourceId: data.sourceId,
      sourceUrl: data.sourceUrl,
      artworkUrl: data.artworkUrl || undefined,
      duration: data.duration || undefined,
    };

    addTrackMutation.mutate(processedData);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setFetchedData(null);
    setSelectedPlaylists([]);
  };

  // Reset state when sheet closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep(1);
      setFetchedData(null);
      setSelectedPlaylists([]);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <div className="hidden">
          <SheetTitle>Add Song</SheetTitle>
          <SheetDescription>Add a new song to your library.</SheetDescription>
        </div>
        {currentStep === 1 && <LinkStep onNext={handleStep1Next} />}
        {currentStep === 2 && fetchedData && (
          <>
            <TrackForm
              initialData={fetchedData}
              onSubmit={handleStep2Submit}
              onBack={handleBack}
              mode="add"
              artists={[
                ...fetchedData.artist.map((artist) => ({
                  value: artist,
                  label: artist,
                })),
                ...(artists ?? []),
              ]}
            />
            <PlaylistSelector
              options={formattedPlaylists ?? []}
              selected={selectedPlaylists}
              onChange={setSelectedPlaylists}
            />
            <Button type="submit" form="track-form">
              Add Song
            </Button>
            <Button onClick={handleBack}>Back</Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
