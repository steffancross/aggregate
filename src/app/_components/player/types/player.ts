export interface MusicPlayerAdapter {
  loadTrack(trackUrl: string): Promise<void>;
  play(): void;
  pause(): void;
  isPlaying(): Promise<boolean>;
  getCurrentTime(): Promise<number>;
  seekTo(seconds: number): void;
  setVolume(value: number): void;
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

export interface Track {
  // id: string;
  title: string;
  // artist?: string;
  url: string;
  source: "spotify" | "soundcloud" | "youtube" | "local";
  duration?: number;
  // artwork?: string;
}
