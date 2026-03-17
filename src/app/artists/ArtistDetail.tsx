import { type LibraryTrack } from "~/app/library/DataTable";
import { PlaylistItem } from "~/app/playlist/[id]/PlaylistItem";
import { Separator } from "~/components/ui/separator";

type ArtistDetailProps = {
  artistName: string;
  albums: {
    albumName: string | null;
    albumId: number | null;
    playlistId: number;
    tracks: LibraryTrack[];
  }[];
};

export const ArtistDetail = ({ artistName, albums }: ArtistDetailProps) => {
  return (
    <div className="px-2">
      <h1 className="mt-7 font-bold">{artistName}</h1>
      <div className="mt-4 w-full">
        {albums.map((album, index) => (
          <div key={index} className="mb-4">
            <p className="text-m">{album.albumName ?? "No Album"}</p>
            <Separator className="my-1" />
            <div className="flex w-[90%] flex-col gap-2">
              {album.tracks.map((track, index) => (
                <PlaylistItem
                  key={track.id}
                  index={index}
                  title={track.title}
                  position={index}
                  artists={track.artists}
                  playlist={album.tracks}
                  playlistId={album.playlistId}
                  trackId={track.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
