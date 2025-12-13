"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";

import { api } from "~/trpc/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export interface AddPlaylistFormData {
  name: string;
}

export const AddPlaylist = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const utils = api.useUtils();
  const form = useForm<AddPlaylistFormData>({
    defaultValues: {
      name: "",
    },
  });

  const addPlaylistMutation = api.playlists.addPlaylist.useMutation({
    onSuccess: async () => {
      await utils.playlists.getAll.invalidate();
      onOpenChange(false);
      toast.success("Playlist added");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error adding playlist");
    },
  });

  const handleSubmit = ({ name }: { name: string }) => {
    addPlaylistMutation.mutate({ name });
    handleOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <div className="hidden">
          <SheetTitle>Add Song</SheetTitle>
          <SheetDescription>Add a new song to your library.</SheetDescription>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-10">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Playlist name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Playlist name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Add</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
