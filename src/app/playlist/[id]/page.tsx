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
      <div className="mx-auto flex w-[90%] flex-col items-center justify-center md:w-[70%]">
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
    </>
  );
};

export default Playlist;
