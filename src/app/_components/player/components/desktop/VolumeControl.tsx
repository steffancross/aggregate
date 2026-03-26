import { SpeakerWaveIcon } from "@heroicons/react/24/solid";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";
interface VolumeControlProps {
  onVolumeChange: (value: number[]) => void;
}

export const VolumeControl = ({ onVolumeChange }: VolumeControlProps) => {
  const volume = useMusicPlayerStore((s) => s.volume);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={cn("h-4 p-0!")}>
          <SpeakerWaveIcon className="size-4" fill="#fff" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="z-101 w-fit">
        <Slider
          value={[volume]}
          onValueChange={onVolumeChange}
          max={100}
          step={1}
          orientation="vertical"
          className="w-fit"
          thumbClassName="hidden"
        />
      </PopoverContent>
    </Popover>
  );
};
