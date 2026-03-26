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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <PlaylistHeader
          playlistId={playlist.playlistId}
          playlistName={playlist.playlistName}
        />
      </div>
      <div className="mx-auto flex min-h-0 w-[90%] flex-1 flex-col items-center overflow-y-auto md:w-[70%]">
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
              trackId={song.trackId}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Playlist;
