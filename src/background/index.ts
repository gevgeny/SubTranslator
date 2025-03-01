import { translate, cancelTranslate } from './translate';
import { TranslateEvent } from '../types';

type TranslateRequest = { type: 'translate' } & TranslateEvent;
type OpenSettingsRequest = { type: 'open-settings' };
type CancelLastTranslateRequest = { type: 'cancel-last-translate' };

type Request = TranslateRequest | OpenSettingsRequest | CancelLastTranslateRequest;

async function translateHandler(
  request: TranslateRequest,
  sendResponse: (response: any) => void,
) {
  try {
    const translations = await translate(
      request.text,
      request.sourceLang,
      request.targetLang,
    );
    sendResponse({ translations });
  } catch (error) {
    if (error.name !== 'AbortError') throw error;
    sendResponse({ isCanceled: true });
  }
}

async function openSettingsHandler() {
  await chrome.action.openPopup();
  setTimeout(() => {
    chrome.runtime.sendMessage(undefined, { type: 'open-settings' });
  }, 100);
}
chrome.runtime.onMessage.addListener((request: Request, sender, sendResponse) => {
  if (request.type === 'translate') {
    translateHandler(request, sendResponse);
    return true;
  }
  if (request.type === 'open-settings') {
    openSettingsHandler();
    return;
  }
  if (request.type === 'cancel-last-translate') {
    cancelTranslate();
    return;
  }
});
