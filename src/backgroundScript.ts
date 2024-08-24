let sessionId: string | undefined;

let brands = navigator.userAgentData?.brands;
let os_name: string | undefined;
let os_version: string | undefined;

function sendAnalytics({
  os_name,
  os_version,
  brands,
  session_id,
  host,
  meta = {},
  type,
  event,
}: AnalyticsEvent) {
  const body = {
    type,
    event,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ua: navigator.userAgent,
    language: navigator.language,
    meta,
    session_id,
    page_id: host,
    path: host ? `/${host}` : undefined,
    os_name,
    os_version,
    brands,
  };

  fetch('https://sub-translator.vercel.app/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((r) => r.json())
    .then((response) =>
      console.log('analytics request:', body, 'analytics response:', response),
    );
}

navigator.userAgentData
  ?.getHighEntropyValues(['platform', 'platformVersion'])
  .then((values) => {
    os_name = values.platform;
    os_version = values.platformVersion;
    const url = encodeURI(
      `https://sub-translator.vercel.app/api/uninstall/` +
        `?v=${chrome.runtime.getManifest().version}` +
        `&l=${navigator.language}` +
        `&ua=${navigator.userAgent}` +
        `&tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}` +
        `&os=${os_name}` +
        `&osv=${os_version}` +
        `&brands=${JSON.stringify(brands)}`,
    );

    chrome.runtime.setUninstallURL(url);
  });

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    sendAnalytics({
      type: 'event',
      event: 'install',
      host: 'install',
      os_name,
      os_version,
      session_id: sessionId,
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
      os_name,
      os_version,
      session_id: sessionId,
      brands,
    });

    sendAnalytics({
      type: 'event',
      event: 'popup',
      host: msg.host,
      os_name,
      os_version,
      session_id: sessionId,
      brands,
      meta: {
        sourceLang: msg.sourceLang,
        targetLang: msg.targetLang,
        isHidden: msg.isHidden,
        theme: msg.theme,
      },
    });
  }
});
