import { getPrefs } from "./prefs";

function injectCss(path: string) {
  const link = document.createElement("link");
  link.href = chrome.extension.getURL(path);
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}

function injectJs(path: string) {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL(path);
  s.onload = function() {
    (this as any).remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

injectCss("src/index.css");
injectCss("src/spinner.css");
injectJs('src/index.js');

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.from === 'popup') {
    getPrefs((prefs) => {
      console.log(prefs);
      document.dispatchEvent(new CustomEvent('prefs', { detail: prefs }));
    });
  }
});



