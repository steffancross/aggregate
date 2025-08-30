import { api } from "~/trpc/server";

const Playlist = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: playlistId } = await params;
  const playlist = await api.playlists.getById({
    id: parseInt(playlistId),
  });
  const songs = playlist?.playlistEntries;

  return (
    <>
      <h1>{playlist?.name}</h1>
      {songs?.map((song) => {
        return (
          <div key={song.position} className="flex flex-row justify-between">
            <p>{song.libraryTrack.title}</p>
            <p>
              {song.libraryTrack.artists
                .map((artist) => artist.artist.name)
                .join(", ")}
            </p>
          </div>
        );
      })}
    </>
  );
};

export default Playlist;
