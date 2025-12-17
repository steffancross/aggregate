"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { getTrackData } from "~/lib/actions/getTrackData";
import { type TrackData } from "~/server/lib/getTrackData";
import { ArrowRight } from "lucide-react";
import { Spinner } from "~/components/ui/spinner";
import { toast } from "sonner";

interface LinkStepProps {
  onNext: (data: TrackData) => void;
}

export const LinkStep = ({ onNext }: LinkStepProps) => {
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkSubmit = async () => {
    setIsLoading(true);

    try {
      const trackData = await getTrackData(link);
      onNext(trackData);
    } catch (err) {
      toast.error(
        "Failed to fetch track data. Please check the link and try again.",
      );
      setLink("");
      console.error("Error fetching track data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="song link"
          />
          <Button onClick={handleLinkSubmit} variant="ghost">
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
};
