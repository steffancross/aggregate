// https://developers.google.com/youtube/iframe_api_reference

import type { MusicPlayerAdapter } from "../types/player";

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          events?: {
            onReady?: (event: string) => void;
            onStateChange?: (event: number) => void;
            onError?: (event: { data: number }) => void;
          };
          playerVars?: {
            disablekb?: number;
          };
        },
      ) => YouTubeWidget;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
  }
}

interface YouTubeWidget {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void; // don't use this
  loadVideoById: ({
    videoId,
    startSeconds,
    endSeconds,
  }: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (value: number) => void;
  getVolume: () => number;
  getPlayerState: () => number; // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = video cued
  getCurrentTime: () => number;
  getDuration: () => number;
  addEventListener: (
    event: string,
    listener: (event: { data: number }) => void,
  ) => void; // The listener is a string that identifies the function that will no longer execute when the specified event fires
  removeEventListener: (
    event: string,
    listener: (event: { data: number }) => void,
  ) => void;
}

export class YouTubeAdapter implements MusicPlayerAdapter {
  private player: YouTubeWidget | null = null;
  private iframeId: string;
  private isReady: boolean = false;
  private isInitialized: boolean = false;

  constructor(iframeId: string = "youtube-player") {
    this.iframeId = iframeId;
  }

  async loadTrack(trackUrl: string): Promise<void> {
    this.isReady = false;

    if (!this.isInitialized) {
      await this.initializeWidget(trackUrl);
    } else {
      await this.loadNewTrack(trackUrl);
    }
  }

  private async initializeWidget(trackUrl: string): Promise<void> {
    const iframe = this.getOrCreateIframe();
    const embedUrl = `https://www.youtube.com/embed/${trackUrl}?enablejsapi=1&autoplay=1&origin=${window.location.origin}`;
    iframe.src = embedUrl;

    return new Promise((resolve) => {
      this.player = new window.YT.Player(this.iframeId, {
        playerVars: {
          disablekb: 1,
        },
        events: {
          onReady: () => {
            this.isReady = true;
            this.isInitialized = true;
            resolve();
          },
          onError: (event) => {
            console.error("YouTube player error:", event.data);
          },
        },
      });
    });
  }

  private async loadNewTrack(trackUrl: string): Promise<void> {
    if (!this.player) {
      console.warn("Player not initialized");
      return;
    }

    this.isReady = false;

    return new Promise((resolve) => {
      const onStateChange = (event: { data: number }) => {
        if (event.data === 1) {
          this.isReady = true;
          this.player!.removeEventListener("onStateChange", onStateChange);
          resolve();
        }
      };

      this.player!.addEventListener("onStateChange", onStateChange);

      this.player!.loadVideoById({
        videoId: trackUrl,
      });
    });
  }

  play(): void {
    if (!this.player || !this.isReady) {
      console.warn("YouTube player not ready for play");
      return;
    }

    this.player.playVideo();
  }

  pause(): void {
    if (!this.player || !this.isReady) {
      console.warn("YouTube player not ready for pause");
      return;
    }

    this.player.pauseVideo();
  }

  async isPlaying(): Promise<boolean> {
    if (!this.player || !this.isReady) {
      console.warn("YouTube player not ready for isPlaying");
      return false;
    }

    return Promise.resolve(this.player.getPlayerState() === 1);
  }

  async getCurrentTime(): Promise<number> {
    if (!this.player || !this.isReady) {
      console.warn("YouTube player not ready for getCurrentTime");
      return 0;
    }

    return Promise.resolve(this.player.getCurrentTime());
  }

  seekTo(seconds: number): void {
    if (!this.player || !this.isReady) {
      console.warn("YouTube player not ready for seekTo");
      return;
    }

    this.player.seekTo(seconds / 1000, true); // coming in as ms, youtube wants seconds
  }

  setVolume(value: number): void {
    if (!this.player || !this.isReady) {
      console.warn("YouTube player not ready for setVolume");
      return;
    }

    this.player.setVolume(value);
  }

  get duration(): number {
    if (!this.player || !this.isReady) {
      console.warn("YouTube player not ready for getDuration");
      return 0;
    }

    return this.player.getDuration();
  }

  readonly sound: null = null;

  private getOrCreateIframe(): HTMLIFrameElement {
    let iframe = document.getElementById(this.iframeId) as HTMLIFrameElement;

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = this.iframeId;
      iframe.style.display = "none";

      // Add to DOM (you might want to customize this)
      const container = document.getElementById("player-container");
      if (container) {
        container.appendChild(iframe);
      }
    }

    return iframe;
  }
}
