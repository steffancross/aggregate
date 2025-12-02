import type { SongSource } from "@prisma/client";

export interface MusicPlayerAdapter {
  loadTrack(trackUrl: string): Promise<void>;
  play(): void | Promise<void>;
  pause(): void | Promise<void>;
  isPlaying(): Promise<boolean>;
  getCurrentTime(): Promise<number>;
  seekTo(seconds: number): void | Promise<void>;
  setVolume(value: number): void | Promise<void>;
  readonly duration: number;
  readonly sound: SoundCloudSound | null;
}

export interface SoundCloudSound {
  artwork_url: string;
  full_duration: number; //in ms
  permalink_url: string;
  id: number;
  title: string;
  streamable: boolean;
  user: {
    avatar_url: string;
    username: string;
  };
  waveform_url: string;
}

export interface PlaylistTrack {
  playlistId: number;
  playlistName: string;
  trackId: number;
  position: number;
  album: string | null;
  albumId: number | null;
  artists: { artistId: number; artistName: string }[];
  title: string;
  source: SongSource;
  sourceId: string | null;
  sourceUrl: string | null;
  artworkUrl: string | null;
  duration: number | null;
}
