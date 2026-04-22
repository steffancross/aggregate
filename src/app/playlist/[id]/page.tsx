import { api } from "~/trpc/server";
import { ArtworkDisplay } from "./ArtworkDisplay";
import { PlaylistHeader } from "./PlaylistHeader";
import { PlaylistItem } from "./PlaylistItem";

const Playlist = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: playlistId } = await params;
  const playlist = await api.playlists.getById({
    id: parseInt(playlistId),
  });

  if (!playlist) return <div>Playlist not found</div>;

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 grid-rows-1 p-2 md:grid-cols-[2fr_1fr]">
      <div className="flex h-full min-h-0 flex-col overflow-hidden pr-2">
        <div className="shrink-0">
          <PlaylistHeader
            playlistId={playlist.playlistId}
            playlistName={playlist.playlistName}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto [scrollbar-gutter:stable] md:gap-2">
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
      <div className="hidden md:block">
        <ArtworkDisplay />
      </div>
    </div>
  );
};

export default Playlist;
