// https://developer.spotify.com/documentation/web-playback-sdk/reference#spotifyplayer

import { getOrRefreshSpotifyToken } from "~/lib/actions/getOrRefreshSpotifyToken";
import type { MusicPlayerAdapter } from "../types/player";

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
  addListener: (
    event:
      | "ready"
      | "not_ready"
      | "player_state_changed"
      | "autoplay_failed"
      | "initialization_error"
      | "authentication_error"
      | "account_error"
      | "playback_error",
    callback: (data: {
      device_id: string;
      message: string;
    }) => Promise<void> | void,
  ) => void;
  removeListener: (eventname: string) => void;
  on: (event: string, callback: (data: { message: string }) => void) => void;
}

interface SpotifyPlayerState {
  // https://developer.spotify.com/documentation/web-playback-sdk/reference#webplaybackstate-object
  paused: boolean;
  position: number; // in ms
}

export class SpotifyAdapter implements MusicPlayerAdapter {
  private player: SpotifyWidget | null = null;
  private isReady: boolean = false;
  private isInitialized: boolean = false;
  private deviceId: string | null = null;

  private async initializeWidget(trackId: string): Promise<void> {
    return new Promise((resolve) => {
      const setupPlayer = () => {
        const player = new window.Spotify.Player({
          name: "Aggregate",
          getOAuthToken: async (cb) => {
            const token = await getOrRefreshSpotifyToken();
            cb(token);
          },
          volume: 1,
        });

        this.player = player;

        player.addListener("ready", async ({ device_id }) => {
          this.deviceId = device_id;
          this.isInitialized = true;
          this.isReady = true;
          await this.loadNewTrack(trackId);
          resolve();
        });

        player.addListener("not_ready", ({ device_id }) => {
          console.warn("Spotify not ready", device_id);
        });

        player.on("initialization_error", ({ message }) => {
          console.error("Spotify failed to initialize", message);
        });

        player.on("authentication_error", ({ message }) => {
          console.error("Spotify failed to authenticate", message);
        });

        player.on("playback_error", ({ message }) => {
          console.error("Spotify failed to connect", message);
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
      console.error("Failed to load Spotify track");
    }
    this.isReady = true;
  }

  async play(): Promise<void> {
    if (!this.player || !this.isReady) {
      console.warn("Spotify player not ready for play");
      return;
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

  readonly sound: null = null;
}
