import { api } from "~/trpc/server";

const Playlist = async ({ params }: { params: { id: string } }) => {
  const playlist = await api.playlists.getById({
    id: parseInt(params.id),
  });
  const songs = playlist?.playlistEntries;

  console.log(playlist, "+++++");

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
