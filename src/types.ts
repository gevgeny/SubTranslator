type ViewPopupEvent = {
  sourceLang: string;
  targetLang: string;
  host: string;
  isHidden: boolean;
  theme: 'dark' | 'light';
};

interface AnalyticsEvent {
  type: 'pageview' | 'event';
  event: 'pageview' | 'popup' | 'install' | 'uninstall';
  host?: string;
  meta?: object;
  os_name?: string;
  os_version?: string;
  brands?: NavigatorUABrandVersion[];
  session_id?: string;
}
