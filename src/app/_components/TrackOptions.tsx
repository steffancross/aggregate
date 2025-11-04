import { Ellipsis } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { EditTrack } from "./forms/EditTrack";
import { useState } from "react";
import type { PlaylistTrack } from "./player/types/player";

export const TrackOptions = ({ song }: { song: PlaylistTrack }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Popover>
        <PopoverTrigger>
          <Ellipsis className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent>
          <div onClick={() => setOpen(true)}>Edit</div>
        </PopoverContent>
      </Popover>
      {open && <EditTrack open={open} onOpenChange={setOpen} song={song} />}
    </>
  );
};
