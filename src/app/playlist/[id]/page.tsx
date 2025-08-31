import { api } from "~/trpc/server";
import { Ellipsis } from "lucide-react";

const Playlist = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: playlistId } = await params;
  const playlist = await api.playlists.getById({
    id: parseInt(playlistId),
  });
  const songs = playlist?.playlistEntries;

  return (
    <div className="grid w-full place-items-center">
      <h1 className="mt-7">{playlist?.name}</h1>
      {songs?.map((song, index) => {
        return (
          <div
            key={song.position}
            className="flex w-7/10 flex-row items-center justify-between border border-blue-500"
          >
            <div className="flex flex-row items-center gap-4">
              <p>{index + 1}.</p>
              <div className="flex flex-col">
                <p>{song.libraryTrack.title}</p>
                <p>
                  {song.libraryTrack.artists
                    .map((artist) => artist.artist.name)
                    .join(", ")}
                </p>
              </div>
            </div>
            <div className="flex flex-row">
              <Ellipsis />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Playlist;
