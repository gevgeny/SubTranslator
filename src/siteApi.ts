import { isVisible } from "./utils";

interface SiteSpecificApi {
  subtitleSelector: string;
  maskContainerSelector?: string;
  subtitleTransformType: "replace" | "mask";
  getSubtitleElement: () => HTMLElement;
  getSubtitlePopupMountTarget: () => HTMLElement;
  pause: () => void;
}

const siteApiMap: Record<string, SiteSpecificApi> = {
  "kino.pub": {
    subtitleSelector: ".jw-captions",
    subtitleTransformType: "replace",
    getSubtitleElement: () => document.querySelector<HTMLElement>(".jw-captions")!,
    getSubtitlePopupMountTarget: () => document.querySelector<HTMLElement>("#player")!,
    pause: () => {
      const pauseIconEl = document.querySelector<HTMLElement>(".jw-controlbar .jw-svg-icon-pause");
      if (!isVisible(pauseIconEl)) return;

      document
        .querySelector("#player")
        ?.dispatchEvent?.(new KeyboardEvent("keydown", { code: "Space", keyCode: 32 }));
    },
  },
  "www.netflix.com": {
    subtitleSelector: ".player-timedtext",
    subtitleTransformType: "replace",
    getSubtitleElement: () => document.querySelector<HTMLElement>(".player-timedtext")!,
    getSubtitlePopupMountTarget: () => document.querySelector<HTMLElement>(".watch-video")!,
    pause: () => {
      document.querySelector<HTMLButtonElement>('[data-uia^="control-play-pause-pause"]')?.click();
    },
  },
  "www.youtube.com": {
    subtitleSelector: "#ytd-player .caption-window",
    subtitleTransformType: "replace",
    getSubtitleElement: () =>
      document.querySelector("#movie_player .ytp-caption-window-container")!,
    getSubtitlePopupMountTarget: () => document.querySelector("#movie_player")!,
    pause: () => {
      if (document.querySelector<HTMLVideoElement>("#movie_player video")!.paused) return;
      document.querySelector<HTMLButtonElement>("#movie_player .ytp-play-button")?.click();
    },
  },
  "www.primevideo.com": {
    subtitleTransformType: "mask",
    subtitleSelector: ".atvwebplayersdk-captions-overlay",
    maskContainerSelector: ".atvwebplayersdk-captions-text",
    getSubtitleElement: () => document.querySelector(".atvwebplayersdk-captions-overlay")!,
    getSubtitlePopupMountTarget: () => document.querySelector(".atvwebplayersdk-player-container")!,
    pause: () => {
      console.log("pause");
      // console.log('btn', document.querySelector<HTMLButtonElement>('.atvwebplayersdk-overlays-container button[aria-label="Pause"]'));
      // document.querySelector<HTMLButtonElement>('.atvwebplayersdk-overlays-container button[aria-label="Pause"]')?.click();
    },
  },
};

export function getSiteSpecificApi(host: string) {
  return siteApiMap[host];
}
