import { SoundCloudAdapter } from "./adapters/SoundCloudAdapter";
import { YouTubeAdapter } from "./adapters/YouTubeAdapter";
import type {
  MusicPlayerAdapter,
  PlaylistTrack,
  SoundCloudSound,
} from "./types/player";

export class AudioController {
  private currentAdapter: MusicPlayerAdapter | null = null;
  private currentTrack: PlaylistTrack | null = null;
  private playlist: PlaylistTrack[] = [];
  private currentIndex: number = -1;

  private async createAdapterForSource(
    source: PlaylistTrack["source"],
  ): Promise<void> {
    // if we don't have a current adapter, or the we're swapping source type, reset the adapter
    if (this.currentAdapter && this.currentTrack?.source !== source) {
      this.currentAdapter = null;
    }

    if (!this.currentAdapter) {
      switch (source) {
        case "soundcloud":
          this.currentAdapter = new SoundCloudAdapter();
          break;
        case "youtube":
          this.currentAdapter = new YouTubeAdapter();
          break;
        default:
          console.error(`Unsupported track source: ${source}`);
      }
    }
  }

  async loadPlaylist(playlist: PlaylistTrack[], index: number) {
    this.playlist = playlist;
    this.currentIndex = index;

    if (this.playlist.length > 0) {
      await this.createAdapterForSource(this.playlist[index]!.source);
      await this.loadTrackByIndex(this.currentIndex);
    }
  }

  async loadTrack(track: PlaylistTrack) {
    await this.createAdapterForSource(track.source);
    await this.currentAdapter!.loadTrack(track.sourceIdentifier);
    this.currentTrack = track;
  }

  private async loadTrackByIndex(index: number) {
    if (index < 0 || index >= this.playlist.length) {
      console.warn("invalid index, loadTrackByIndex");
      return;
    }

    const track = this.playlist[index];
    if (!track) {
      console.warn("no track, loadTrackByIndex");
      return;
    }

    await this.createAdapterForSource(track.source);

    await this.currentAdapter!.loadTrack(track.sourceIdentifier);
    this.currentTrack = track;
    this.currentIndex = index;
  }

  // NAVIGATION
  async nextTrack() {
    if (!this.canGoNext()) {
      console.warn("no next track, goNextTrack");
      return;
    }

    await this.loadTrackByIndex(this.currentIndex + 1);
  }

  async previousTrack() {
    if (!this.canGoPrevious()) {
      console.warn("no previous track, goPreviousTrack");
      return;
    }

    await this.loadTrackByIndex(this.currentIndex - 1);
  }

  // PLAYBACK
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
      return -1;
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

  // GETTERS
  private canGoNext(): boolean {
    return this.currentIndex < this.playlist.length - 1;
  }

  private canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  getCurrentTrack(): PlaylistTrack | null {
    return this.currentTrack;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getPlaylistLength(): number {
    return this.playlist.length;
  }

  get duration(): number {
    if (!this.currentAdapter) {
      console.warn("no adapter, getDuration");
      return 0;
    }
    return this.currentAdapter.duration;
  }

  get sound(): SoundCloudSound | null {
    if (!this.currentAdapter) {
      console.warn("no adapter, getSound");
      return null;
    }
    return this.currentAdapter.sound;
  }
}
