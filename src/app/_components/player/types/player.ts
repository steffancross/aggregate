export interface MusicPlayerAdapter {
  loadTrack(trackUrl: string): Promise<void>;
  play(): void;
  pause(): void;
  isPlaying(): Promise<boolean>;
  getCurrentTime(): Promise<number>;
  seekTo(seconds: number): void;
  setVolume(value: number): void;
}

export interface Track {
  // id: string;
  title: string;
  // artist?: string;
  url: string;
  source: "spotify" | "soundcloud" | "youtube" | "local";
  // duration?: number;
  // artwork?: string;
}
