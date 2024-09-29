type ViewPopupEvent = {
  sourceLang: string;
  targetLang: string;
  host: string;
  isHidden: boolean;
  theme: 'dark' | 'light';
};

interface AnalyticsEvent {
  event: 'popup' | 'install' | 'uninstall';
  site?: string;
  meta?: object;
  os_name?: string;
  os_version?: string;
  session_id?: string;
}
