import { SoundCloudAdapter } from "./adapters/SoundCloudAdapter";
import type { MusicPlayerAdapter, Track } from "./types/player";

export class AudioController {
  private currentAdapter: MusicPlayerAdapter | null = null;
  private currentTrack: Track | null = null;

  async loadTrack(track: Track) {
    switch (track.source) {
      case "soundcloud":
        this.currentAdapter = new SoundCloudAdapter();
        break;
      default:
        throw new Error(`Unsupported track source: ${track.source}`);
    }

    this.currentTrack = track;
    await this.currentAdapter.loadTrack(track.url);
  }

  async play() {
    if (!this.currentAdapter) {
      console.warn("no adapter, play");
      return;
    }
    this.currentAdapter.play();
  }

  async pause() {
    if (!this.currentAdapter) {
      console.warn("no adapter, pause");
      return;
    }
    this.currentAdapter.pause();
  }

  async isPlaying() {
    if (!this.currentAdapter) {
      console.warn("no adapter, isPlaying");
      return false;
    }
    return await this.currentAdapter.isPlaying();
  }

  async getCurrentTime() {
    if (!this.currentAdapter) {
      console.warn("no adapter, getCurrentTime");
      return 0;
    }
    return await this.currentAdapter.getCurrentTime();
  }

  seekTo(seconds: number) {
    if (!this.currentAdapter) {
      console.warn("no adapter, seekTo");
      return;
    }
    this.currentAdapter.seekTo(seconds);
  }

  setVolume(value: number) {
    if (!this.currentAdapter) {
      console.warn("no adapter, setVolume");
      return;
    }
    this.currentAdapter.setVolume(value);
  }
}
