import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { MultiSelect } from "./MultiSelectCombo";
import { type TrackData } from "~/lib/actions/getTrackData";
import { Button } from "~/components/ui/button";

export interface AddTrackFormData {
  album: string;
  artist: string[];
  artworkUrl: string;
  duration: number;
  source: "soundcloud" | "youtube";
  sourceId: string;
  sourceUrl: string;
  title: string;
}

export const TrackForm = ({
  initialData,
  onSubmit,
  onBack,
  mode,
  artists,
}: {
  initialData: TrackData;
  onSubmit: (data: AddTrackFormData) => void;
  onBack: () => void;
  mode: "add" | "edit";
  artists: { value: string; label: string }[];
}) => {
  const form = useForm<AddTrackFormData>({
    defaultValues: {
      album: "",
      artist: initialData.artist ? [initialData.artist] : [],
      artworkUrl: initialData.artworkUrl,
      duration: initialData.duration,
      source: initialData.source,
      sourceId: initialData.sourceId,
      sourceUrl: initialData.sourceUrl,
      title: initialData.title,
    },
  });

  const handleSubmit = (data: AddTrackFormData) => {
    //TODO: form validation
    if (!data.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!data.artist.length || data.artist.every((name) => !name.trim())) {
      alert("At least one artist is required");
      return;
    }

    if (!data.source || !data.sourceId || !data.sourceUrl) {
      alert(
        "Source information is missing. Please try fetching the track data again.",
      );
      return;
    }

    const validArtists = data.artist.filter((name) => name.trim() !== "");
    if (validArtists.length === 0) {
      alert("At least one valid artist name is required");
      return;
    }

    onSubmit({
      ...data,
      artist: validArtists,
    });
  };

  return (
    <div className="mt-10">
      {/* TODO: maybe use, don't always know where the image is coming from */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="h-30 w-30"
        src={initialData.artworkUrl}
        alt={initialData.title}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          <p>Source: {initialData.source}</p>
          <Button type="submit">Add Song</Button>
          <Button type="button" onClick={onBack}>
            Back
          </Button>
        </form>
      </Form>
    </div>
  );
};
