import { isVisible } from './utils';

interface SiteSpecificApi {
  getSubtitleElement: () => HTMLElement;
  getSubtitlePopupMountTarget: () => HTMLElement;
  pause: () => void;
  play: () => void;
}

const siteApiMap: Record<string, SiteSpecificApi> = {
  'kino.pub': {
    getSubtitleElement: () => document.querySelector<HTMLElement>('.jw-captions')!,
    getSubtitlePopupMountTarget: () => document.querySelector<HTMLElement>('#player')!,
    pause: () => {
      const pauseIconEl = document.querySelector<HTMLElement>('.jw-controlbar .jw-svg-icon-pause');
      if (!isVisible(pauseIconEl)) return;
      
      document.querySelector('#player')?.dispatchEvent?.(
        new KeyboardEvent('keydown', { code: 'Space', keyCode: 32 }),
      );
    },
    play: () => {
      // play not made
      const pauseIconEl = document.querySelector<HTMLElement>('.jw-controlbar .jw-svg-icon-pause');
      if (!isVisible(pauseIconEl)) return;
      
      document.querySelector('#player')?.dispatchEvent?.(
        new KeyboardEvent('keydown', { code: 'Space', keyCode: 32 }),
      );
    },
  },
  'www.netflix.com': {
    getSubtitleElement: () => document.querySelector<HTMLElement>('.player-timedtext')!,
    getSubtitlePopupMountTarget: () => document.querySelector<HTMLElement>('.watch-video')!,
    pause: () => {
      document.querySelector<HTMLButtonElement>(
        '[data-uia^="control-play-pause-pause"]',
      )?.click();
    },
    play: () => {
      document.querySelector<HTMLButtonElement>(
        '[data-uia^="control-play-pause-play"]',
      )?.click();
    }
  },
  'www.disneyplus.com': {
    getSubtitleElement: () => document.querySelector<HTMLElement>('.dss-hls-subtitle-overlay')!,
    getSubtitlePopupMountTarget: () => document.querySelector<HTMLElement>('#hudson-wrapper')!,
    pause: () => {
      document.querySelector<HTMLButtonElement>(
        'button.pause-icon',
      )?.click();
    },
    play: () => {
      document.querySelector<HTMLButtonElement>(
        'button.play-icon',
      )?.click();
    }
  },
  'www.youtube.com': {
    getSubtitleElement: () => document.querySelector('#movie_player .ytp-caption-window-container')!,
    getSubtitlePopupMountTarget: () => document.querySelector('#movie_player')!,
    pause: () => {
      if (document.querySelector<HTMLVideoElement>('#movie_player video')!.paused) return;
      document.querySelector<HTMLButtonElement>('#movie_player .ytp-play-button')?.click();
    },
    play: () => {
      if (!document.querySelector<HTMLVideoElement>('#movie_player video')!.paused) return;
      document.querySelector<HTMLButtonElement>('#movie_player .ytp-play-button')?.click();
    }
  },
  'open.spotify.com': {
    getSubtitleElement: () => document.querySelector('.main-view-container__scroll-node-child>main[aria-label="Spotify"]>div>div>div')!,
    getSubtitlePopupMountTarget: () => document.querySelector('.main-view-container__scroll-node-child>main[aria-label="Spotify"]')!,
    pause: () => {
      document.querySelector<HTMLButtonElement>('.player-controls button[aria-label="Pause"]')?.click();
    },
    play: () => {
      // play not made
      document.querySelector<HTMLButtonElement>('.player-controls button[aria-label="Pause"]')?.click();
    }
  },
};

export function getSiteSpecificApi() {
    return siteApiMap[location.host];
}
