import { wrapSentenceWords, updateWordsToHide } from './textProcessing/wrapSentenceWords';
import addMouseEnterLeaveEventListeners from './addMouseEnterLeaveEventListeners';
import { translate, cancelTranslate } from './translate';
import { insertTranslationPopup, insertTranslationResult, hideTranslationPopup } from './translationPopup';
import { defaultPrefs, Prefs } from './preferencePopup/prefs';
import {
  subWordClassName,
  subContainerClassName,
  subPopupClassName,
  getTranslationHTML,
  subWordReveal,
  getSubtitlesWordHTML,
  getSubtitlesHiddenWordHTML,
} from './markup';
import startTextMutationObserver from './startTextMutationObserver';
import { getSiteSpecificApi } from './siteApi';


const siteApi = getSiteSpecificApi();
let sourceLang: string = defaultPrefs.sourceLang;
let targetLang: string = defaultPrefs.targetLang;

/**
 * Wraps words in the target text in separate tags.
 * */
function processSubtitlesElement(textNode: Text): void {
  const parentElClassList = textNode.parentElement?.classList;
  if (parentElClassList?.contains?.(subWordClassName) || parentElClassList?.contains?.(subContainerClassName)) return;

  const processedText = wrapSentenceWords(
    textNode.textContent!, getSubtitlesWordHTML, getSubtitlesHiddenWordHTML,
  ).text;
  const span = document.createElement('span');

  span.className = subContainerClassName;
  span.innerHTML = processedText;
  textNode.parentElement!.replaceChild(span, textNode);
}

/**
 * Translate provided word and show popup with translation over the word.
 * */
function showTranslationPopup(subWordEl: HTMLElement): void {
  subWordEl.classList.add(subWordReveal);
  const containerEl = siteApi.getSubtitlePopupMountTarget();
  const popupEl = insertTranslationPopup(subWordEl, containerEl);

  siteApi.pause();

  translate(subWordEl.innerText, sourceLang, targetLang).then((translation) => {
    const html = getTranslationHTML(translation, sourceLang, targetLang);
    insertTranslationResult(popupEl, html);
  }).catch(error => {
    if (error.name !== 'AbortError') {
      throw error;
    }
  });
}

// Observe subtitles change on a page and replace text nodes with hidden words
// or with just custom nodes to make translation on mouseover easier
startTextMutationObserver({
  getTargetElement: siteApi.getSubtitleElement,
  onTextAppear: processSubtitlesElement
});

// Toggle the popup with translation on mouseenter/mouseleave a word in the subtitles.
addMouseEnterLeaveEventListeners({
  targetElClassName: subWordClassName,
  ignoreElClassName: subPopupClassName,
  onEnter: showTranslationPopup,
  onLeave: (subWordEl) => {
    hideTranslationPopup();
    subWordEl.classList.remove(subWordReveal);
    cancelTranslate();
  },
});

// Listen to changes in preferences and update lang and word settings.
document.addEventListener('prefs', (event: CustomEvent<Prefs>) => {
  const prefs = event.detail;
  updateWordsToHide(
    prefs.hideWords, prefs.wordCount, prefs.contractions, prefs.informal
  );
  sourceLang = prefs.sourceLang;
  targetLang = prefs.targetLang;
});