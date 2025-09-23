import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

export const AddSong = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Song</SheetTitle>
        </SheetHeader>
        <SheetDescription>Add a song to your library</SheetDescription>
      </SheetContent>
    </Sheet>
  );
};
