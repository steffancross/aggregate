import { useMusicPlayerStore } from "../MusicPlayerStore";
import type { PlaylistTrack } from "../types/player";

export const fisherYatesShuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

/**
 * Toggle shuffle from the playlist header or music player control
 * If we don't have a currPlaylist, just updating the store
 * If we do, swapping and updating the playlist state
 */
export const toggleShuffle = async () => {
  const {
    isShuffleOn,
    setIsShuffleOn,
    currentPlaylist,
    setCurrentPlaylist,
    currentPlaylistId,
    controller,
  } = useMusicPlayerStore.getState();

  setIsShuffleOn(!isShuffleOn);

  // Not an error state, don't want to do anything more if we don't have a current playlist
  if (!currentPlaylist) return;

  if (!currentPlaylistId || !controller) {
    console.warn("No current playlist or controller, skipping shuffle toggle");
    return;
  }

  if (isShuffleOn) {
    const { playlist, trackIndex } =
      restoreOriginalPlaylistWithCurrentPosition();
    setCurrentPlaylist(playlist, currentPlaylistId, {
      preservePlaybackState: true,
      newTrackIndex: trackIndex,
    });
    await controller.loadPlaylist(playlist, trackIndex, true);
  } else {
    const shuffledPlaylist = reserveCurrentAndShuffleRest();
    setCurrentPlaylist(shuffledPlaylist, currentPlaylistId, {
      preservePlaybackState: true,
    });
    await controller.loadPlaylist(shuffledPlaylist, 0, true);
  }
};

/**
 * Reserve the current track, shuffle the rest of the playlist, unshift reserved track, and return the shuffled playlist
 */
export const reserveCurrentAndShuffleRest = (): PlaylistTrack[] => {
  const { currentPlaylist, currentTrackIndex } = useMusicPlayerStore.getState();

  const currentTrackId = currentPlaylist![currentTrackIndex]!.trackId;
  let currentTrackIndexInBasePlaylist = currentPlaylist!.findIndex(
    (track) => track.trackId === currentTrackId,
  );

  if (currentTrackIndexInBasePlaylist === -1) {
    currentTrackIndexInBasePlaylist = 0;
  }

  const reservedTrack = currentPlaylist![currentTrackIndexInBasePlaylist]!;
  const playlistWithoutCurrentTrack = currentPlaylist!.filter(
    (track) => track.trackId !== currentTrackId,
  );
  const shuffledRestOfPlaylist = fisherYatesShuffle(
    playlistWithoutCurrentTrack,
  );
  const shuffledPlaylist = [reservedTrack, ...shuffledRestOfPlaylist];

  return shuffledPlaylist;
};

const restoreOriginalPlaylistWithCurrentPosition = (): {
  playlist: PlaylistTrack[];
  trackIndex: number;
} => {
  const { currentPlaylist, currentTrackIndex, originalPlaylist } =
    useMusicPlayerStore.getState();
  const currentTrackId = currentPlaylist![currentTrackIndex]!.trackId;
  const originalTrackIndex = originalPlaylist!.findIndex(
    (track) => track.trackId === currentTrackId,
  );
  return {
    playlist: originalPlaylist!,
    trackIndex: originalTrackIndex,
  };
};
