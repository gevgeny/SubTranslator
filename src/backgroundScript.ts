import { UAParser } from 'ua-parser-js';

let sessionId: string | undefined;

let os_name: string | undefined;
let os_version: string | undefined;
const { browser } = UAParser(navigator.userAgent);

async function getOrCreateUserId() {
  const result = await chrome.storage.local.get('userId');
  let userId = result.userId;
  if (!userId) {
    userId = self.crypto.randomUUID();
    await chrome.storage.local.set({ userId });
  }
  return userId;
}

async function sendAnalytics({ site, meta = {}, event }: AnalyticsEvent) {
  // const body = {
  //   e: event,
  //   tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  //   l: navigator.language,
  //   sid: sessionId,
  //   s: site ?? '',
  //   osn: os_name,
  //   osv: os_version,
  //   b: browser.name,
  //   bv: browser.major,
  //   uid: await getOrCreateUserId(),
  //   meta,
  // };
  //
  // fetch('https://sub-translator.vercel.app/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(body),
  // }).then((r) => r.json());
}

if (navigator.userAgentData?.getHighEntropyValues) {
  Promise.all([
    navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion']),
    getOrCreateUserId(),
  ]).then(([values, userId]) => {
    os_name = values.platform;
    os_version = values.platformVersion;
    const url = encodeURI(
      // `https://sub-translator.vercel.app/api/uninstall/?uid=${userId}`,
      `https://app.whirr.co/p/clzpavjjl01iior0hza2y7zk5`,
    );

    chrome.runtime.setUninstallURL(url);
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    sendAnalytics({
      event: 'install',
      meta: { v: chrome.runtime.getManifest().version },
    });
  }
});

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'session') {
    sessionId = crypto.randomUUID();
  } else if (msg.type === 'view-popup') {
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    sendAnalytics({
      event: 'popup',
      site: msg.host,
      meta: {
        sl: msg.sourceLang,
        tl: msg.targetLang,
        h: msg.isHidden,
      },
    });
  } else if (msg.type === 'open-settings') {
    await chrome.action.openPopup();
    setTimeout(() => {
      chrome.runtime.sendMessage(undefined, { type: 'open-settings' });
    }, 100);
  }
});
