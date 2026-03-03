import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";

export const ConfirmationDialog = ({
  text,
  onConfirm,
  open,
  onOpenChange,
}: {
  text: string;
  onConfirm: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="pt-3 sm:text-center">{text}</DialogHeader>
        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
