import { SoundCloudAdapter } from "./adapters/SoundCloudAdapter";
import { SpotifyAdapter } from "./adapters/SpotifyAdapter";
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
  private adapters = new Map<string, MusicPlayerAdapter>();

  private async createAdapterForSource(
    source: PlaylistTrack["source"],
  ): Promise<void> {
    // persist adapter update
    if (this.adapters.has(source)) {
      this.currentAdapter = this.adapters.get(source)!;
      return;
    }

    let adapter: MusicPlayerAdapter;
    switch (source) {
      case "soundcloud":
        adapter = new SoundCloudAdapter();
        break;
      case "youtube":
        adapter = new YouTubeAdapter();
        break;
      case "spotify":
        adapter = new SpotifyAdapter();
        break;
      default:
        console.error(`Unsupported track source: ${source}`);
        return;
    }

    this.adapters.set(source, adapter);
    this.currentAdapter = adapter;
  }

  async loadPlaylist(
    playlist: PlaylistTrack[],
    index: number,
    skipTrackLoad: boolean = false,
  ) {
    this.playlist = playlist;
    this.currentIndex = index;

    if (this.playlist.length > 0 && !skipTrackLoad) {
      await this.loadTrackByIndex(this.currentIndex);
    }
  }

  async loadTrack(track: PlaylistTrack) {
    await this.createAdapterForSource(track.source);
    const trackIdentifier = this.getTrackIdentifier(track);
    await this.currentAdapter!.loadTrack(trackIdentifier!);
    this.currentTrack = track;
  }

  private getTrackIdentifier(track: PlaylistTrack) {
    switch (track.source) {
      case "soundcloud":
        return track.sourceUrl;
      case "youtube":
        return track.sourceId;
      case "spotify":
        return track.sourceId;
      default:
        console.error(`Unsupported track source: ${track.source}`);
        return "";
    }
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

    // if check, only to filter the noise on first play
    if (this.currentAdapter) {
      await this.currentAdapter.pause();
    }

    await this.createAdapterForSource(track.source);
    const trackIdentifier = this.getTrackIdentifier(track);
    await this.currentAdapter!.loadTrack(trackIdentifier!); // based on source type, we know the identifier will exist
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
    await this.currentAdapter.play();
  }

  async pause() {
    if (!this.currentAdapter) {
      console.warn("no adapter, pause");
      return;
    }
    await this.currentAdapter.pause();
  }

  async isPlaying() {
    if (!this.currentAdapter) {
      console.warn("no adapter, isPlaying");
      return false;
    }
    return await this.currentAdapter.isPlaying();
  }

  // time related values at this level are in seconds
  async getCurrentTime() {
    if (!this.currentAdapter) {
      console.warn("no adapter, getCurrentTime");
      return -1;
    }
    return await this.currentAdapter.getCurrentTime();
  }

  async seekTo(seconds: number) {
    if (!this.currentAdapter) {
      console.warn("no adapter, seekTo");
      return;
    }
    await this.currentAdapter.seekTo(seconds);
  }

  // value is between 0 - 100, adapters are responsible for converting to their own range
  async setVolume(value: number) {
    if (!this.currentAdapter) {
      console.warn("no adapter, setVolume");
      return;
    }
    await this.currentAdapter.setVolume(value);
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

    const trackDuration = this.currentTrack?.duration;
    if (trackDuration !== null && trackDuration !== undefined) {
      return trackDuration / 1000;
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

  getMediaMetadata(): MediaMetadataInit | null {
    if (!this.currentTrack) {
      return null;
    }

    return {
      title: this.currentTrack.title,
      artist: this.currentTrack.artists
        .map((artist) => artist.artistName)
        .join(", "),
      album: this.currentTrack.album ?? undefined,
      artwork: this.currentTrack.artworkUrl
        ? [
            {
              src: this.currentTrack.artworkUrl,
            },
          ]
        : [],
    };
  }

  async activateElement() {
    if (!this.currentAdapter) {
      console.warn("no adapter, activateElement");
      return;
    }
    await this.currentAdapter.activateElement?.();
  }
}
