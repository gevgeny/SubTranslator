import { getPrefs } from './preferencePopup/prefs';
import { injectCss, injectJs } from './utils';


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



