import { getPrefs } from "./prefs";

// Listen for messages
const a: number = 1;
console.log('hi', 1);


function injectCss(path: string) {
  const link = document.createElement("link");
  link.href = chrome.extension.getURL(path);
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}

injectCss("src/inject.css");
injectCss("src/spinner.css");

const s = document.createElement('script');
s.src = chrome.runtime.getURL('src/inject.js');
s.onload = function() {
  (this as any).remove();
};
(document.head || document.documentElement).appendChild(s);



chrome.runtime.onMessage.addListener((msg) => {
  if (msg.from === 'popup') {
    getPrefs((prefs) => {
      console.log(prefs);
      document.dispatchEvent(new CustomEvent('prefs', { detail: prefs }));
    });
  }
});



