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

interface FormData {
  externalLink: string;
  source: "soundcloud" | "youtube";
  sourceId: string;
  sourceUrl: string;
  duration: number;
  artworkUrl: string;
  title: string;
  artist: string[];
  album: string;
}

export const TrackForm = ({
  initialData,
  onSubmit,
  onBack,
  mode,
  artists,
}: {
  initialData: TrackData;
  onSubmit: (data: FormData) => void;
  onBack: () => void;
  mode: "add" | "edit";
  artists: { value: string; label: string }[];
}) => {
  const form = useForm<FormData>({
    defaultValues: {
      externalLink: initialData.sourceUrl,
      sourceId: initialData.sourceId,
      source: initialData.source,
      title: initialData.title,
      artist: initialData.artist ? [initialData.artist] : [],
      album: "",
      duration: initialData.duration,
      artworkUrl: initialData.artworkUrl,
    },
  });

  const handleSubmit = (data: FormData) => {
    console.log(data);
    // onSubmit({
    //   ...data,
    //   sourceUrl: initialData.sourceUrl,
    //   sourceId: initialData.sourceId,
    // });
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
