let sessionId: string | undefined;

let brands = navigator.userAgentData?.brands;
let os_name: string | undefined;
let os_version: string | undefined;

navigator.userAgentData
  ?.getHighEntropyValues(['platform', 'platformVersion'])
  .then((values) => {
    os_name = values.platform;
    os_version = values.platformVersion;
    const url =
      `https://sub-translator.vercel.app/api/uninstall/` +
      `?v=${chrome.runtime.getManifest().version}` +
      `&l=${navigator.language}&ua=${navigator.userAgent}` +
      `&tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}` +
      `&os=${os_name}` +
      `&osv=${os_version}` +
      `&brands=${JSON.stringify(brands)}`;
    console.log('url', url);
    chrome.runtime.setUninstallURL(url);
  });

interface AnalyticsEvent {
  type: 'pageview' | 'event';
  event: 'pageview' | 'popup' | 'install' | 'uninstall';
  host?: string;
  meta?: object;
}
function sendAnalytics({ host, meta = {}, type, event }: AnalyticsEvent) {
  fetch('https://sub-translator.vercel.app/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      event,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ua: navigator.userAgent,
      language: navigator.language,
      meta,
      session_id: sessionId,
      page_id: host,
      path: host ? `/${host}` : undefined,
      os_name,
      os_version,
      brands,
    }),
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    sendAnalytics({
      type: 'event',
      event: 'install',
      host: 'install',
      meta: {
        time: +new Date(),
        version: chrome.runtime.getManifest().version,
      },
    });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'session') {
    sessionId = crypto.randomUUID();
  }
  if (msg.type === 'view-popup') {
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    sendAnalytics({
      type: 'pageview',
      event: 'pageview',
      host: msg.host,
    });

    sendAnalytics({
      type: 'event',
      event: 'popup',
      host: msg.host,
      meta: {
        sourceLang: msg.sourceLang,
        targetLang: msg.targetLang,
        isHidden: msg.isHidden,
        theme: msg.theme,
      },
    });
  }
});
