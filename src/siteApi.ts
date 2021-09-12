import { isVisible } from './utils';

const siteApiMap: Record<string, { getSubtitleElement: () => HTMLElement; pause: () => void }> = {
  'kino.pub': {
    getSubtitleElement: () => document.querySelector<HTMLElement>('.jw-captions')!,
    pause: () => {
      const pauseIconEl = document.querySelector<HTMLElement>('.jw-controlbar .jw-svg-icon-pause');
      if (!isVisible(pauseIconEl)) return;
      
      console.log('document.querySelector(\'#player\')', document.querySelector('#player'));
      document.querySelector('#player')?.dispatchEvent?.(
        new KeyboardEvent('keydown', { code: 'Space', keyCode: 32 }),
      );
    },
  },
  'www.netflix.com': {
    getSubtitleElement: () => document.querySelector<HTMLElement>('.player-timedtext')!,
    pause: () => {
      document.querySelector<HTMLButtonElement>(
        '[data-uia^="control-play-pause-pause"]',
      )?.click();
    }
  },
};

export function getSiteSpecificApi() {
    return siteApiMap[location.host];
}
