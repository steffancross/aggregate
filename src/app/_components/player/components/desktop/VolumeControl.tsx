import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Volume2 } from "lucide-react";
import { useMusicPlayerStore } from "~/app/_components/player/MusicPlayerStore";

interface VolumeControlProps {
  onVolumeChange: (value: number[]) => void;
}

export const VolumeControl = ({ onVolumeChange }: VolumeControlProps) => {
  const volume = useMusicPlayerStore((s) => s.volume);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="-ml-1">
          <Volume2 className="size-4.5" fill="#fff" />
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
