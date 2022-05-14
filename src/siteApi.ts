import { isVisible } from './utils';

interface SiteSpecificApi {
  getSubtitleElement: () => HTMLElement;
  getSubtitlePopupMountTarget: () => HTMLElement;
  pause: () => void;
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
  },
  'www.netflix.com': {
    getSubtitleElement: () => document.querySelector<HTMLElement>('.player-timedtext')!,
    getSubtitlePopupMountTarget: () => document.querySelector<HTMLElement>('.watch-video')!,
    pause: () => {
      document.querySelector<HTMLButtonElement>(
        '[data-uia^="control-play-pause-pause"]',
      )?.click();
    }
  },
  'www.youtube.com': {
    getSubtitleElement: () => document.querySelector('.ytp-caption-window-container')!,
    getSubtitlePopupMountTarget: () => document.querySelector('.html5-video-player')!,
    pause: () => {
      if (document.querySelector<HTMLVideoElement>('#ytd-player video')!.paused) return;
      document.querySelector<HTMLButtonElement>('.ytp-play-button')?.click();
    }
  },
};

export function getSiteSpecificApi() {
    return siteApiMap[location.host];
}
