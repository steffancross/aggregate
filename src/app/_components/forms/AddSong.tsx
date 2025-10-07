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

export const AddSong = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data } = api.artists.getAll.useQuery();
  const [currentStep, setCurrentStep] = useState(1);
  const [fetchedData, setFetchedData] = useState<TrackData | null>(null);

  const handleStep1Next = (data: TrackData) => {
    setFetchedData(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: any) => {
    console.log("Final form data:", data);
    // TODO: Implement actual submission logic
    onOpenChange(false);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setFetchedData(null);
  };

  // Reset state when sheet closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep(1);
      setFetchedData(null);
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
          <TrackForm
            initialData={fetchedData}
            onSubmit={handleStep2Submit}
            onBack={handleBack}
            mode="add"
            artists={[
              { value: fetchedData.artist, label: fetchedData.artist },
              ...(data ?? []),
            ]}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
