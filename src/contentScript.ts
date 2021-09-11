import { getPrefs } from './preferencePopup/prefs';

function injectCss(path: string): void {
  const link = document.createElement('link');
  link.href = chrome.extension.getURL(path);
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.getElementsByTagName('head')[0].appendChild(link);
}

async function injectJs(path: string): Promise<void> {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(path);
    s.onload = function () {
      (this as HTMLScriptElement).remove();
      resolve();
    };
    (document.head || document.documentElement).appendChild(s);
  });
}

function sendCurrentPrefsToInjectedScripts(): void {
  getPrefs((prefs) => {
    document.dispatchEvent(new CustomEvent('prefs', { detail: prefs }));
  });
}

injectCss('src/index.css');
injectCss('src/spinner.css');
injectJs('src/index.js').then(sendCurrentPrefsToInjectedScripts);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.from === 'popup') {
    sendCurrentPrefsToInjectedScripts();
  }
});



