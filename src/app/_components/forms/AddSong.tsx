import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "~/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { MultiSelect } from "./MultiSelectCombo";
import { getTrackData } from "~/lib/actions/getTrackData";

interface FormData {
  externalLink: string;
  source: "soundcloud" | "youtube" | "";
  title: string;
  artist: string[];
  album: string;
}

export const AddSong = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const form = useForm<FormData>({
    defaultValues: {
      externalLink: "",
      source: "",
      title: "",
      artist: [],
      album: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    console.log(data);
  };

  const handleLinkInput = async (value: string) => {
    // TODO: make this more robust, proper checking and validation
    const trackData = await getTrackData(value);
    form.setValue("externalLink", value);
    form.setValue(
      "source",
      value.includes("soundcloud") ? "soundcloud" : "youtube",
    );
    form.setValue("title", trackData.title);
    form.setValue("artist", [trackData.artist]);

    console.log(trackData);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    form.reset();
  };

  const artists = [
    { value: "evenS", label: "evenS" },
    { value: "janu4ryss", label: "janu4ryss" },
    { value: "nujabes", label: "nujabes" },
    { value: "9lives", label: "9lives" },
  ];

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Song</SheetTitle>
        </SheetHeader>
        <SheetDescription>Add a song to your library</SheetDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="externalLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Link"
                      onChange={(e) => {
                        field.onChange(e);
                        void handleLinkInput(e.target.value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={true}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="soundcloud">SoundCloud</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      {/* <SelectItem value="spotify">Spotify</SelectItem> */}
                      {/* <SelectItem value="local">Local</SelectItem> */}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Title" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={artists}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Artist"
                      allowAdd={true}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="album"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Album</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Album" />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
            Add Song
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
