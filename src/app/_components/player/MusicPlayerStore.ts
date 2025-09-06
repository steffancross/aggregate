import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PlaylistTrack } from "./types/player";
import type { AudioController } from "./AudioController";

interface MusicPlayerState {
  // playlist state
  currentPlaylist: PlaylistTrack[] | null;
  currentPlaylistId: number | null;
  currentTrackIndex: number;

  // player state
  isPlaying: boolean;
  isLoaded: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  isSeeking: boolean;
  loadedOnce: boolean;

  // controller
  controller: AudioController | null;

  // actions
  setCurrentPlaylist: (playlist: PlaylistTrack[], playlistId: number) => void;
  setCurrentTrackIndex: (trackIndex: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoaded: (isLoaded: boolean) => void;
  setVolume: (volume: number) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setIsSeeking: (isSeeking: boolean) => void;
  setLoadedOnce: (loadedOnce: boolean) => void;
  setController: (controller: AudioController) => void;

  // computed values
  currentTrack: PlaylistTrack | null;
  hasNextTrack: boolean;
  hasPreviousTrack: boolean;
}

export const useMusicPlayerStore = create<MusicPlayerState>()(
  devtools(
    (set) => ({
      currentPlaylist: null,
      currentPlaylistId: null,
      currentTrackIndex: 0,
      isPlaying: false,
      isLoaded: false,
      volume: 100,
      duration: 0,
      currentTime: 0,
      isSeeking: false,
      loadedOnce: false,

      setCurrentPlaylist: (playlist: PlaylistTrack[], playlistId: number) =>
        set({
          currentPlaylist: playlist,
          currentPlaylistId: playlistId,
          currentTrackIndex: 0,
          currentTime: 0,
          duration: 0,
          isLoaded: false,
          isPlaying: false,
        }),

      setCurrentTrackIndex: (index: number) =>
        set({ currentTrackIndex: index }),
      setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
      setIsLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
      setVolume: (volume: number) => set({ volume }),
      setDuration: (duration: number) => set({ duration }),
      setCurrentTime: (time: number) => set({ currentTime: time }),
      setIsSeeking: (seeking: boolean) => set({ isSeeking: seeking }),
      setLoadedOnce: (loadedOnce: boolean) => set({ loadedOnce: loadedOnce }),
      setController: (controller: AudioController) => set({ controller }),
    }),
    {
      name: "music-player-store",
    },
  ),
);

// computed getters didn't work with devtools, so moving outside
export const useMusicPlayerComputed = () => {
  const { currentPlaylist, currentTrackIndex } = useMusicPlayerStore();

  return {
    currentTrack: currentPlaylist?.[currentTrackIndex] ?? null,
    hasNextTrack: currentPlaylist
      ? currentTrackIndex < currentPlaylist.length - 1
      : false,
    hasPreviousTrack: currentTrackIndex > 0,
  };
};
