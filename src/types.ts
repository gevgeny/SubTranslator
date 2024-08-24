export type ViewPopupEvent = {
  sourceLang: string;
  targetLang: string;
  host: string;
  isHidden: boolean;
  theme: 'dark' | 'light';
};

export interface AnalyticsEvent {
  type: 'pageview' | 'event';
  event: 'pageview' | 'popup' | 'install' | 'uninstall';
  host?: string;
  meta?: object;
}
