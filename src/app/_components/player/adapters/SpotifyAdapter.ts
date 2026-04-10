// https://developer.spotify.com/documentation/web-playback-sdk/reference#spotifyplayer

import { getOrRefreshSpotifyToken } from "~/lib/actions/getOrRefreshSpotifyToken";
import { useMusicPlayerStore } from "../MusicPlayerStore";
import type { MusicPlayerAdapter } from "../types/player";
import { startAnchorAndUpdateMediaSession } from "../utils";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void | Promise<void>;
        volume?: number;
      }) => SpotifyWidget;
    };
  }
}

interface SpotifyWidget {
  connect: () => void; // actually returns a promise but the events handle it
  disconnect: () => void;
  getCurrentState: () => Promise<SpotifyPlayerState>;
  setName: (name: string) => Promise<void>;
  getVolume: () => Promise<number>; // float 0-1
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (position: number) => Promise<void>; // position in milliseconds
  addListener<E extends keyof PlayerEventMap>(
    event: E,
    callback: (data: PlayerEventMap[E]) => Promise<void> | void,
  ): void;
  removeListener: (eventname: string) => void;
  on: (event: string, callback: (data: { message: string }) => void) => void;
  activateElement: () => Promise<void>;
}

interface SpotifyPlayerState {
  // https://developer.spotify.com/documentation/web-playback-sdk/reference#webplaybackstate-object
  // not really complete? just console the data and will see a bunch more
  context: {
    uri: string | null;
  };
  loading: boolean;
  paused: boolean;
  position: number; // in ms
  duration: number; // in ms
  repeat_mode: number | null;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    next_tracks: SpotifyTrack[];
    previous_tracks: SpotifyTrack[];
  };
}

type SpotifyTrack = {
  uri: string;
  id: string;
  type: string;
  media_type: string;
  name: string;
  is_playable: boolean;
};

type ErrorData = {
  message: string;
};

type PlayerData = {
  device_id: string;
};

type PlayerEventMap = {
  ready: PlayerData;
  not_ready: PlayerData;

  player_state_changed: SpotifyPlayerState;

  initialization_error: ErrorData;
  authentication_error: ErrorData;
  playback_error: ErrorData;
  account_error: ErrorData;

  autoplay_failed: null;
};

export class SpotifyAdapter implements MusicPlayerAdapter {
  private player: SpotifyWidget | null = null;
  private isReady: boolean = false;
  private isInitialized: boolean = false;
  private deviceId: string | null = null;
  private lastLoadedTrackId: string | null = null; // from the last successful 'loadNewTrack', used to defer 'resume()' until the SDK matches.

  async initializeWidget(trackId?: string): Promise<void> {
    return new Promise((resolve) => {
      const setupPlayer = () => {
        if (this.isInitialized) {
          resolve();
          return;
        }

        const player = new window.Spotify.Player({
          name: "Aggregate",
          getOAuthToken: async (cb) => {
            const token = await getOrRefreshSpotifyToken();
            cb(token);
          },
          volume: 1,
        });

        this.player = player;

        player.addListener("ready", async (data) => {
          if (!data.device_id) return;
          this.deviceId = data.device_id;
          this.isInitialized = true;
          this.isReady = true;
          if (trackId) {
            await this.loadNewTrack(trackId);
          }
          resolve();
        });

        player.addListener("player_state_changed", async (data) => {
          if (data === null) return;
          const { currentPlaylist, currentTrackIndex } =
            useMusicPlayerStore.getState();
          const expectedId =
            currentPlaylist?.[currentTrackIndex]?.sourceId ?? null;
          const currentId = data.track_window?.current_track?.id ?? null;
          if (!data.paused && !data.loading) {
            if (expectedId && currentId === expectedId) {
              useMusicPlayerStore.getState().setIsPlaying(true);
              void startAnchorAndUpdateMediaSession();
            }
          }
        });

        player.addListener("not_ready", (data) => {
          if (!data.device_id) return;
          console.warn("Spotify not ready", data.device_id);
        });

        player.on("initialization_error", (data) => {
          if (!data.message) return;
          console.error("Spotify failed to initialize", data.message);
        });

        player.on("authentication_error", (data) => {
          if (!data.message) return;
          console.error("Spotify failed to authenticate", data.message);
        });

        player.on("playback_error", (data) => {
          if (!data.message) return;
          // sometimes fires on first play, race condition, not really a problem
          console.warn("Spotify failed to connect", data.message);
        });

        player.on("autoplay_failed", () => {
          console.error("Spotify failed to autoplay");
        });

        player.connect();
      };

      if (window.Spotify) {
        setupPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = setupPlayer;
      }
    });
  }

  async loadTrack(trackId: string): Promise<void> {
    this.isReady = false;

    if (!this.isInitialized) {
      await this.initializeWidget(trackId);
    } else {
      await this.loadNewTrack(trackId);
    }
  }

  private async loadNewTrack(trackId: string): Promise<void> {
    if (!this.player) {
      console.warn("Spotify player not ready for loadNewTrack");
      return;
    }

    if (this.deviceId === null) {
      console.warn("Spotify deviceId not found for loadNewTrack");
      return;
    }

    const token = await getOrRefreshSpotifyToken();
    if (!token) {
      console.warn("Spotify token not found for loadNewTrack");
      return;
    }

    const uri = `spotify:track:${trackId}`;

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [uri],
          position_ms: 0,
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "Failed to load Spotify track",
        JSON.stringify(await response.json(), null, 2),
      );
      return;
    }
    this.lastLoadedTrackId = trackId;
    this.isReady = true;
  }

  async play(): Promise<void> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for play");
      return;
    }

    if (this.lastLoadedTrackId) {
      await this.waitUntilCurrentTrackIs(this.lastLoadedTrackId);
    }
    await this.player.resume();
  }

  async pause(): Promise<void> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for pause");
      return;
    }

    await this.player.pause();
  }

  async isPlaying(): Promise<boolean> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for isPlaying");
      return false;
    }

    const state = await this.player.getCurrentState();
    return !state.paused;
  }

  async getCurrentTime(): Promise<number> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for getCurrentTime");
      return 0;
    }

    const state = await this.player.getCurrentState();
    if (state === null) return 0;
    return state.position / 1000;
  }

  async seekTo(milliseconds: number): Promise<void> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for seekTo");
      return;
    }

    await this.player.seek(milliseconds);
  }

  async setVolume(value: number): Promise<void> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for setVolume");
      return;
    }

    await this.player.setVolume(value / 100);
  }

  get duration(): number {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for getDuration");
      return 0;
    }
    // spotify doesn't make it available here and not worth a call
    return 0;
  }

  async activateElement(): Promise<void> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for activateElement");
      return;
    }
    await this.player.activateElement();
  }

  private async waitUntilCurrentTrackIs(trackId: string): Promise<void> {
    if (!this.player) return;
    const deadline = Date.now() + 5_000;
    while (Date.now() < deadline) {
      const state = await this.player.getCurrentState();
      if (state?.track_window?.current_track?.id === trackId) {
        return;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    console.warn(
      "Spotify: timed out waiting for track switch; track id:",
      trackId,
    );
  }

  readonly sound: null = null;
}
