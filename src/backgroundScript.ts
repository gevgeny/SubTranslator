let sessionId: string | undefined;

interface AnalyticsEvent {
  type: 'pageview' | 'event';
  event: 'pageview' | 'install' | 'uninstall';
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
    console.log('sessionId', sessionId);
  }
  if (msg.type === 'view-popup') {
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    sendAnalytics({
      type: 'pageview',
      event: 'pageview',
      host: msg.host,
      meta: {
        from: msg.from,
        to: msg.to,
        isHidden: msg.isHidden,
        theme: msg.theme,
      },
    });
  }
});

chrome.runtime.setUninstallURL(
  `https://sub-translator.vercel.app/api/uninstall/?v=${chrome.runtime.getManifest().version}&l=${navigator.language}&ua=${navigator.userAgent}&tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
);
