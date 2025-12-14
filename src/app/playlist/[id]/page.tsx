import { api } from "~/trpc/server";
import { PlaylistItem } from "./PlaylistItem";

import { PlaylistHeader } from "./PlaylistHeader";

const Playlist = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: playlistId } = await params;
  const playlist = await api.playlists.getById({
    id: parseInt(playlistId),
  });

  if (!playlist) return <div>Playlist not found</div>;

  return (
    <>
      <PlaylistHeader
        playlistId={playlist.playlistId}
        playlistName={playlist.playlistName}
      />
      <div className="mx-auto flex flex-col items-center justify-center">
        {playlist.playlistEntries.map((song, index) => {
          return (
            <PlaylistItem
              key={song.position}
              index={index}
              title={song.title}
              position={song.position}
              artists={song.artists}
              playlist={playlist.playlistEntries}
              playlistId={song.playlistId}
            />
          );
        })}
      </div>
    </>
  );
};

export default Playlist;
