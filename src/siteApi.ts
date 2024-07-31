interface SiteSpecificApi {
  subtitleSelector: string;
  maskContainerSelector?: string;
  subtitleTransformType: 'replace' | 'mask';
  subtitlePopupSelector: string;
  pause: () => boolean;
  play: () => void;
}

const siteApiMap: Record<string, SiteSpecificApi> = {
  'kino.pub': {
    subtitleTransformType: 'replace',
    subtitleSelector: '.jw-captions',
    subtitlePopupSelector: '#player',
    pause() {
      if (document.querySelector<HTMLVideoElement>('video.jw-video')?.paused) return false;
      document.querySelector<HTMLVideoElement>('video.jw-video')?.pause();
      return true;
    },
    play() {
      document.querySelector<HTMLVideoElement>('video.jw-video')?.play();
    },
  },
  'www.netflix.com': {
    subtitleTransformType: 'replace',
    subtitleSelector: '.player-timedtext',
    subtitlePopupSelector: '.watch-video',
    pause() {
      if (document.querySelector<HTMLButtonElement>('[data-uia^="control-play-pause-play"]'))
        return false;
      document.querySelector<HTMLButtonElement>('[data-uia^="control-play-pause-pause"]')?.click();
      return true;
    },
    play() {
      document.querySelector<HTMLButtonElement>('[data-uia^="control-play-pause-play"]')?.click();
    },
  },
  'www.youtube.com': {
    subtitleTransformType: 'replace',
    subtitleSelector: '#movie_player .ytp-caption-window-container',
    subtitlePopupSelector: '#movie_player',
    pause() {
      if (document.querySelector<HTMLVideoElement>('#movie_player video')?.paused) return false;
      document.querySelector<HTMLVideoElement>('#movie_player video')?.pause();
      return true;
    },
    play() {
      document.querySelector<HTMLVideoElement>('#movie_player video')?.play();
    },
  },
  'www.primevideo.com': {
    subtitleTransformType: 'mask',
    subtitleSelector: '.atvwebplayersdk-captions-overlay',
    maskContainerSelector: '.atvwebplayersdk-captions-text',
    subtitlePopupSelector: '.atvwebplayersdk-overlays-container',
    pause() {
      if (document.querySelector<HTMLVideoElement>('#dv-web-player video')?.paused) return false;
      document.querySelector<HTMLVideoElement>('#dv-web-player video')?.pause();
      return true;

      // Legacy way to pause:

      // if (document.querySelector('[aria-label="Play"]')) return;
      // document
      //   .querySelector('.webPlayerSDKUiContainer')
      //   ?.dispatchEvent?.(new KeyboardEvent('keyup', { code: 'Space', keyCode: 32 }));
    },
    play() {
      document.querySelector<HTMLVideoElement>('#dv-web-player video')?.play();
    },
  },
};

export function getSiteSpecificApi(host: string) {
  return siteApiMap[host];
}
