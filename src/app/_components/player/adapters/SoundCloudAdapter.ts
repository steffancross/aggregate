// reference: https://developers.soundcloud.com/docs/api/html5-widget#methods

import { useMusicPlayerStore } from "../MusicPlayerStore";
import type { MusicPlayerAdapter, SoundCloudSound } from "../types/player";

declare global {
  interface Window {
    SC: {
      Widget: {
        (iframeId: string): SoundCloudWidget;
        Events: {
          READY: string;
          ERROR: string;
          LOAD_PROGRESS: number;
          FINISH: string;
          PLAY: string;
          PAUSE: string;
        };
      };
    };
  }
}

interface SoundCloudWidget {
  play: () => void;
  pause: () => void;
  isPaused: (callback: (isPaused: boolean) => void) => void;
  getPosition: (callback: (position: number) => void) => void;
  seekTo: (seconds: number) => void;
  setVolume: (value: number) => void;
  bind: (event: string, callback: () => void) => void;
  unbind: (event: string) => void;
  load: (
    url: string,
    options?: { auto_play?: boolean; callback?: () => void },
  ) => void;
  getDuration: (callback: (duration: number) => void) => void;
  getCurrentSound: (callback: (sound: SoundCloudSound) => void) => void;
}

export class SoundCloudAdapter implements MusicPlayerAdapter {
  private player: SoundCloudWidget | null = null;
  private iframeId: string;
  private isReady: boolean = false;
  private isInitialized: boolean = false;
  private currentSound: SoundCloudSound | null = null;

  constructor(iframeId: string = "soundcloud-player") {
    this.iframeId = iframeId;
  }

  async loadTrack(trackUrl: string): Promise<void> {
    this.isReady = false;

    if (!this.isInitialized) {
      // First time, create the widget
      await this.initializeWidget(trackUrl);
    } else {
      // Subsequent loads
      await this.loadNewTrack(trackUrl);
    }
  }

  private async waitForValidSound(): Promise<SoundCloudSound> {
    return new Promise((resolve) => {
      const checkSound = () => {
        this.player!.getCurrentSound((sound: SoundCloudSound) => {
          if (sound && sound.full_duration > 0) {
            resolve(sound);
          } else {
            setTimeout(checkSound, 100);
          }
        });
      };
      checkSound();
    });
  }

  private async initializeWidget(trackUrl: string): Promise<void> {
    const iframe = this.getOrCreateIframe();
    const encodedUrl = encodeURIComponent(trackUrl);
    const scUrl = `https://w.soundcloud.com/player/?url=${encodedUrl}`;

    iframe.src = scUrl;

    // Wait for iframe to load, then wait for READY event
    return new Promise((resolve) => {
      iframe.onload = () => {
        this.player = window.SC.Widget(this.iframeId);

        if (!this.player) {
          console.warn("SoundCloud widget not found");
          return;
        }

        this.player.bind(window.SC.Widget.Events.READY, () => {
          this.waitForValidSound()
            .then((sound) => {
              this.currentSound = sound;
              this.isReady = true;
              this.isInitialized = true;
              resolve();
            })
            .catch((error) => {
              console.warn("Failed to wait for valid sound:", error);
              resolve();
            });
        });

        this.player.bind(window.SC.Widget.Events.ERROR, (error?: string) => {
          console.warn(`SoundCloud widget error: ${error}`);
        });

        this.player.bind(window.SC.Widget.Events.PLAY, () => {
          useMusicPlayerStore.getState().setIsPlaying(true);
        });

        this.player.bind(window.SC.Widget.Events.FINISH, () => {
          // deprecated, unreliable for now
          // just handling with duration checks
        });
      };

      iframe.onerror = () => {
        console.warn("Failed to load SoundCloud iframe");
      };
    });
  }

  private async loadNewTrack(trackUrl: string): Promise<void> {
    this.isReady = false;
    if (!this.player) {
      console.warn("Player not initialized");
      return;
    }

    return new Promise((resolve) => {
      this.player!.load(trackUrl, {
        auto_play: true,
        callback: () => {
          this.waitForValidSound()
            .then((sound) => {
              this.currentSound = sound;
              this.isReady = true;
              resolve();
            })
            .catch((error) => {
              console.warn("Failed to wait for valid sound:", error);
              resolve();
            });
        },
      });
    });
  }

  play(): void {
    if (!this.player || !this.isReady) {
      console.warn("SoundCloud player not ready for play");
      return;
    }

    this.player.play();
  }

  pause(): void {
    if (!this.player || !this.isReady) {
      console.warn("SoundCloud player not ready for pause");
      return;
    }

    this.player.pause();
  }

  async isPlaying(): Promise<boolean> {
    if (!this.player || !this.isReady) {
      console.warn("SoundCloud player not ready for isPlaying");
      return false;
    }

    return new Promise((resolve) => {
      this.player!.isPaused((isPaused: boolean) => {
        resolve(!isPaused);
      });
    });
  }

  async getCurrentTime(): Promise<number> {
    if (!this.player || !this.isReady) {
      console.warn("SoundCloud player not ready for getCurrentTime");
      return 0;
    }

    return new Promise((resolve) => {
      this.player!.getPosition((position: number) => {
        resolve(position / 1000);
      });
    });
  }

  seekTo(milliseconds: number): void {
    if (!this.player || !this.isReady) {
      console.warn("SoundCloud player not ready for seekTo");
      return;
    }
    if (milliseconds < 0) {
      console.warn("milliseconds out of range");
      return;
    }

    this.player.seekTo(milliseconds);
  }

  setVolume(value: number): void {
    if (!this.player || !this.isReady) {
      console.warn("SoundCloud player not ready for setVolume");
      return;
    }
    if (value < 0 || value > 100) {
      console.warn("volume out of range");
      return;
    }

    this.player.setVolume(value);
  }

  get duration(): number {
    if (!this.currentSound) {
      return 0;
    }
    return this.currentSound.full_duration / 1000;
  }

  get sound(): SoundCloudSound | null {
    return this.currentSound;
  }

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
