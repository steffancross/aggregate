"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { getTrackData, type TrackData } from "~/lib/actions/getTrackData";

interface LinkStepProps {
  onNext: (data: TrackData) => void;
}

export const LinkStep = ({ onNext }: LinkStepProps) => {
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLinkSubmit = async () => {
    setIsLoading(true);

    setIsLoading(true);
    setError(null);

    try {
      const trackData = await getTrackData(link);
      onNext(trackData);
    } catch (err) {
      // TODO: better error handling, show error then reset
      setError(
        "Failed to fetch track data. Please check the link and try again.",
      );
      console.error("Error fetching track data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10">
      {isLoading ? (
        // TODO
        <p>Loading...</p>
      ) : (
        <div>
          <Input value={link} onChange={(e) => setLink(e.target.value)} />
          <Button onClick={handleLinkSubmit}>Next</Button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};
