import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PlaylistTrack } from "./types/player";
import type { AudioController } from "./AudioController";

type setPlaylistOptions = {
  preservePlaybackState?: boolean;
  newTrackIndex?: number;
};

interface MusicPlayerState {
  // playlist state
  currentPlaylist: PlaylistTrack[] | null;
  originalPlaylist: PlaylistTrack[] | null;
  currentPlaylistId: number | null;
  currentTrackIndex: number;

  // player state
  isShuffleOn: boolean;
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
  setCurrentPlaylist: (
    playlist: PlaylistTrack[],
    playlistId: number,
    options?: setPlaylistOptions,
  ) => void;
  setOriginalPlaylist: (playlist: PlaylistTrack[]) => void;
  setCurrentTrackIndex: (trackIndex: number) => void;
  setIsShuffleOn: (isShuffleOn: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoaded: (isLoaded: boolean) => void;
  setVolume: (volume: number) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setIsSeeking: (isSeeking: boolean) => void;
  setLoadedOnce: (loadedOnce: boolean) => void;
  setController: (controller: AudioController) => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>()(
  devtools(
    (set) => ({
      currentPlaylist: null,
      originalPlaylist: null,
      currentPlaylistId: null,
      currentTrackIndex: 0,
      isShuffleOn: false,
      isPlaying: false,
      isLoaded: false,
      volume: 100,
      duration: 0,
      currentTime: 0,
      isSeeking: false,
      loadedOnce: false,

      setCurrentPlaylist: (
        playlist: PlaylistTrack[],
        playlistId: number,
        options?: setPlaylistOptions,
      ) =>
        set(() => {
          const { preservePlaybackState = false, newTrackIndex } =
            options ?? {};

          return {
            currentPlaylist: playlist,
            currentPlaylistId: playlistId,
            currentTrackIndex: newTrackIndex ?? 0,
            ...(preservePlaybackState
              ? {}
              : {
                  currentTime: 0,
                  duration: 0,
                  isLoaded: false,
                  isPlaying: false,
                }),
          };
        }),

      setOriginalPlaylist: (playlist: PlaylistTrack[]) =>
        set({ originalPlaylist: playlist }),
      setCurrentTrackIndex: (index: number) =>
        set({ currentTrackIndex: index }),
      setIsShuffleOn: (isShuffleOn: boolean) => set({ isShuffleOn }),
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
  const currentPlaylist = useMusicPlayerStore((s) => s.currentPlaylist);
  const currentTrackIndex = useMusicPlayerStore((s) => s.currentTrackIndex);

  return {
    currentTrack: currentPlaylist?.[currentTrackIndex] ?? null,
    hasNextTrack: currentPlaylist
      ? currentTrackIndex < currentPlaylist.length - 1
      : false,
    hasPreviousTrack: currentTrackIndex > 0,
  };
};
