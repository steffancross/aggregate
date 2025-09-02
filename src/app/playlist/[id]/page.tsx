import { api } from "~/trpc/server";
import { PlaylistItem } from "./PlaylistItem";

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
          <PlaylistItem
            key={song.position}
            index={index}
            title={song.libraryTrack.title}
            position={song.position}
            artists={song.libraryTrack.artists}
          />
        );
      })}
    </div>
  );
};

export default Playlist;
