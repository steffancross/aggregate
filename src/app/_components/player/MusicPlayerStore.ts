import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AudioController } from "./AudioController";
import type { SpotifyAdapter } from "./adapters/SpotifyAdapter";
import type { PlaylistTrack } from "./types/player";

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
  currentTrack: PlaylistTrack | null;
  queue: PlaylistTrack[] | null;

  // player state
  isShuffleOn: boolean;
  isPlaying: boolean;
  isLoaded: boolean;
  isPlayingFromQueue: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  isSeeking: boolean;
  loadedOnce: boolean;

  // controller
  controller: AudioController | null;
  preInitializedSpotifyAdapter: SpotifyAdapter | null;

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
  setPreInitializedSpotifyAdapter: (adapter: SpotifyAdapter | null) => void;
  setCurrentTrack: (track: PlaylistTrack) => void;
  enqueueTrack: (track: PlaylistTrack) => void;
  dequeueTrack: () => PlaylistTrack | null;
  clearQueue: () => void;
  removeQueueItemAt: (index: number) => void;
  setIsPlayingFromQueue: (isPlayingFromQueue: boolean) => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>()(
  devtools(
    (set) => ({
      currentPlaylist: null,
      originalPlaylist: null,
      currentPlaylistId: null,
      currentTrackIndex: 0,
      queue: null,
      currentTrack: null,
      isShuffleOn: false,
      isPlaying: false,
      isLoaded: false,
      isPlayingFromQueue: false,
      volume: 100,
      duration: 0,
      currentTime: 0,
      isSeeking: false,
      loadedOnce: false,
      controller: null,
      preInitializedSpotifyAdapter: null,

      setCurrentPlaylist: (
        playlist: PlaylistTrack[],
        playlistId: number,
        options?: setPlaylistOptions,
      ) =>
        set((state) => {
          const { preservePlaybackState = false, newTrackIndex } =
            options ?? {};

          const currentTrackIndex = newTrackIndex ?? 0;
          const row = playlist[currentTrackIndex] ?? null;

          const playbackReset = preservePlaybackState
            ? {}
            : {
                currentTime: 0,
                duration: 0,
                isLoaded: false,
                isPlaying: false,
                isPlayingFromQueue: false,
              };

          const currentTrackUpdate =
            preservePlaybackState && state.isPlayingFromQueue
              ? {}
              : {
                  currentTrack: row,
                };

          return {
            currentPlaylist: playlist,
            currentPlaylistId: playlistId,
            currentTrackIndex,
            ...playbackReset,
            ...currentTrackUpdate,
          };
        }),

      setOriginalPlaylist: (playlist: PlaylistTrack[]) =>
        set({ originalPlaylist: playlist }),
      setCurrentTrackIndex: (index: number) =>
        set({ currentTrackIndex: index }),
      setIsShuffleOn: (isShuffleOn: boolean) => set({ isShuffleOn }),
      setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
      setIsLoaded: (loaded: boolean) => set({ isLoaded: loaded }),
      setIsPlayingFromQueue: (isPlayingFromQueue: boolean) =>
        set({ isPlayingFromQueue }),
      setVolume: (volume: number) => set({ volume }),
      setDuration: (duration: number) => set({ duration }),
      setCurrentTime: (time: number) => set({ currentTime: time }),
      setIsSeeking: (seeking: boolean) => set({ isSeeking: seeking }),
      setLoadedOnce: (loadedOnce: boolean) => set({ loadedOnce: loadedOnce }),
      setController: (controller: AudioController) => set({ controller }),
      setPreInitializedSpotifyAdapter: (adapter: SpotifyAdapter) =>
        set({ preInitializedSpotifyAdapter: adapter }),
      setCurrentTrack: (track: PlaylistTrack) => set({ currentTrack: track }),
      enqueueTrack: (track: PlaylistTrack) =>
        set((state) => ({ queue: [...(state.queue ?? []), track] })),
      dequeueTrack: () => {
        let next: PlaylistTrack | null = null;
        set((state) => {
          if (!state.queue?.length) return state;
          next = state.queue[0] ?? null;
          return {
            queue: state.queue.length === 1 ? null : state.queue.slice(1),
          };
        });
        return next;
      },
      clearQueue: () => set({ queue: null }),
      removeQueueItemAt: (index: number) =>
        set((state) => {
          if (!state.queue?.length) return state;
          if (index < 0 || index >= state.queue.length) return state;
          const next = state.queue.filter((_, i) => i !== index);
          return { queue: next.length > 0 ? next : null };
        }),
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
  const queue = useMusicPlayerStore((s) => s.queue);
  const isPlayingFromQueue = useMusicPlayerStore((s) => s.isPlayingFromQueue);

  return {
    hasNextTrack: currentPlaylist
      ? currentTrackIndex < currentPlaylist.length - 1 ||
        (queue && queue.length > 0)
      : false,
    hasPreviousTrack: currentTrackIndex > 0 || isPlayingFromQueue,
  };
};
