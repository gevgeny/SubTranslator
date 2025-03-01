import { getPrefs } from './preferencePopup/prefs';
import { injectCss, injectJs } from './utils';
import { TranslateEvent, Translation, ViewPopupEvent } from './types';

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

document.addEventListener('session', () => {
  chrome.runtime.sendMessage(undefined, { type: 'session' });
});

document.addEventListener('view-popup', (event: CustomEvent<ViewPopupEvent>) => {
  chrome.runtime.sendMessage(undefined, { type: 'view-popup', ...event.detail });
});

document.addEventListener('open-settings', () => {
  chrome.runtime.sendMessage(undefined, { type: 'open-settings' });
});

document.addEventListener('translate', (event: CustomEvent<TranslateEvent>) => {
  chrome.runtime
    .sendMessage(undefined, { type: 'translate', ...event.detail })
    .then((result: { translations?: Translation[] }) => {
      if (!result.translations?.length) return;

      document.dispatchEvent(
        new CustomEvent('translate-result', {
          detail: { translations: result.translations },
        }),
      );
    });
});

document.addEventListener('cancel-last-translate', () => {
  chrome.runtime.sendMessage(undefined, { type: 'cancel-last-translate' });
});
