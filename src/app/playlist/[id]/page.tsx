import { api } from "~/trpc/server";
import { PlaylistItem } from "./PlaylistItem";

const Playlist = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: playlistId } = await params;
  const playlist = await api.playlists.getById({
    id: parseInt(playlistId),
  });

  if (!playlist) return <div>Playlist not found</div>;

  return (
    <div className="grid w-full place-items-center">
      <h1 className="mt-7">{playlist[0]?.playlistName}</h1>
      {playlist?.map((song, index) => {
        return (
          <PlaylistItem
            key={song.position}
            index={index}
            title={song.title}
            position={song.position}
            artists={song.artists}
          />
        );
      })}
    </div>
  );
};

export default Playlist;
