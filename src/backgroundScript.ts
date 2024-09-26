import { UAParser } from 'ua-parser-js';

let sessionId: string | undefined;

let brands = navigator.userAgentData?.brands;
let os_name: string | undefined;
let os_version: string | undefined;
const { browser } = UAParser(navigator.userAgent);

async function getOrCreateUserId() {
  const result = await chrome.storage.local.get('userId');
  console.log('id:', result);
  let userId = result.userId;
  if (!userId) {
    userId = self.crypto.randomUUID();
    console.log('new id:', result);
    await chrome.storage.local.set({ userId });
  }
  return userId;
}

async function sendAnalytics({ host, meta = {}, type, event }: AnalyticsEvent) {
  const body = {
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
    b: browser.name,
    bv: browser.major,
    uid: await getOrCreateUserId(),
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

if (navigator.userAgentData?.getHighEntropyValues) {
  Promise.all([
    navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion']),
    getOrCreateUserId(),
  ]).then(([values, userId]) => {
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
        `&uid=${userId}` +
        `&b=${browser.name}` +
        `&bv=${browser.major}` +
        `&brands=${JSON.stringify(brands)}`,
    );

    chrome.runtime.setUninstallURL(url);
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    sendAnalytics({
      type: 'event',
      event: 'install',
      host: 'install',
      meta: {
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
