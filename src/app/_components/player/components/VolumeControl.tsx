import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number[]) => void;
}

export const VolumeControl = ({
  volume,
  onVolumeChange,
}: VolumeControlProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Volume2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-fit">
        <Slider
          value={[volume]}
          onValueChange={onVolumeChange}
          max={100}
          step={1}
          orientation="vertical"
          className="w-fit"
        />
      </PopoverContent>
    </Popover>
  );
};
