import {
  wrapNodeWords,
  updateWordsToHide,
  maskTextWords,
  WordMask,
} from './textProcessing/wrapNodeWords';
import { translate, cancelTranslate } from './translate';
import {
  insertTranslationPopup,
  insertTranslationResult,
  hideTranslationPopup,
} from './translationPopup';
import { defaultPrefs, Prefs } from './preferencePopup/prefs';
import {
  subWordClassName,
  subContainerClassName,
  subWordReveal,
  getSubtitlesWordHTML,
  getSubtitlesHiddenWordHTML,
  subPopupWrapperClassName,
  getWordMaskHTML,
  subWordMaskClassName,
  getWordWrapperHTML,
} from './markup';
import startTextMutationObserver from './startTextMutationObserver';
import { getSiteSpecificApi } from './siteApi';
import addMouseEnterLeaveEventListeners, {
  createElementFromHTML,
  logPrefix,
  positionElement,
} from './utils';

const siteApi = getSiteSpecificApi(location.host);
let sourceLang = defaultPrefs.sourceLang;
let targetLang = defaultPrefs.targetLang;

const subtitleMasks = new Map<Text, HTMLElement[]>();
let lastHoveredElement: HTMLElement | null = null;
let lastTranslationPopup: HTMLElement | null = null;
let videoPlayTimer: number | undefined;
let isVideoPaused = false;

/**
 * Wraps words of the target text in separate tags.
 * */
function wrapWordsInTextElement(textNode: Text): void {
  const parentElClassList = textNode.parentElement?.classList;
  if (
    parentElClassList?.contains?.(subWordClassName) ||
    parentElClassList?.contains?.(subContainerClassName)
  )
    return;

  const processedText = wrapNodeWords(
    textNode,
    getSubtitlesWordHTML,
    getSubtitlesHiddenWordHTML,
  ).text;
  const wrappedText = createElementFromHTML(getWordWrapperHTML(processedText));
  textNode.parentElement!.replaceChild(wrappedText, textNode);
}

function insertWordMasksInDOM(targetElement: HTMLElement, wordMasks: WordMask[]) {
  const targetElementRect = targetElement.getBoundingClientRect();
  const rectElements: HTMLElement[] = [];

  wordMasks.forEach((wordMask) => {
    const maskHTML = getWordMaskHTML(targetElementRect, wordMask);
    const maskElement = createElementFromHTML(maskHTML);
    targetElement.appendChild(maskElement);
    rectElements.push(maskElement);
  });

  return rectElements;
}

function addWordMasks(textNode: Text) {
  const containerEl = document.querySelector<HTMLElement>(
    'maskContainerSelector' in siteApi
      ? siteApi.maskContainerSelector
      : siteApi.subtitleSelector,
  );
  if (!containerEl) return;

  // Make sure the subtitle element is not static because masks are positioned absolutely
  if (window.getComputedStyle(containerEl).getPropertyValue('position') === 'static') {
    containerEl.style.position = 'relative';
  }

  const wordMasks = maskTextWords(textNode);
  const masks = insertWordMasksInDOM(containerEl, wordMasks);
  subtitleMasks.set(textNode, masks);
}

function removeWordMasks(textNode: Text) {
  const masks = subtitleMasks.get(textNode);
  masks?.forEach((mask) => mask.remove());
  subtitleMasks.delete(textNode);
}

function adjustTranslationPopupPosition() {
  const containerEl = document.querySelector<HTMLElement>(siteApi.subtitlePopupSelector);
  const popupWrapperEl = document.querySelector<HTMLElement>(
    `.${subPopupWrapperClassName}`,
  );

  if (
    !containerEl ||
    !lastHoveredElement ||
    !document.contains(lastHoveredElement) ||
    !lastTranslationPopup ||
    !popupWrapperEl?.shadowRoot?.contains(lastTranslationPopup)
  )
    return;
  positionElement(lastTranslationPopup, lastHoveredElement, containerEl);
}

/**
 * Play video if it was paused and the popup is hidden
 * */
function playVideo() {
  videoPlayTimer = setTimeout(() => {
    if (isVideoPaused && !lastTranslationPopup) {
      siteApi.play();
      isVideoPaused = false;
    }
  }, 300);
}

function translateWord(el: HTMLElement, popupEl: HTMLElement) {
  translate(el.dataset['word'] ?? el.innerText, sourceLang, targetLang)
    .then((translation) => {
      insertTranslationResult(popupEl, translation, sourceLang, targetLang);
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        throw error;
      }
    });
}

// Observe subtitles change on a page and replace text nodes with hidden words
// or with just custom nodes to make translation on mouseover easier
if (siteApi.subtitleTransformType === 'mask') {
  startTextMutationObserver({
    containerSelector: siteApi.subtitleSelector,
    onTextAdded: addWordMasks,
    onTextRemoved: removeWordMasks,
    onTextChanged(textNode) {
      removeWordMasks(textNode);
      addWordMasks(textNode);
    },
  });
} else {
  startTextMutationObserver({
    containerSelector: siteApi.subtitleSelector,
    onTextAdded(textNode) {
      wrapWordsInTextElement(textNode);
    },
  });
}

function onWordLeaveHandler(el: HTMLElement) {
  hideTranslationPopup();
  el.classList.remove(subWordReveal);
  lastHoveredElement = null;
  lastTranslationPopup = null;
  cancelTranslate();
  playVideo();
}
// Show/hide the popup with translation on mousehover of a word in the subtitles.
addMouseEnterLeaveEventListeners({
  selector: `.${subWordClassName}, .${subWordMaskClassName}`,
  ignoreElClassName: subPopupWrapperClassName,

  // Translate hovered word and show translation popup
  onEnter: (el: HTMLElement) => {
    el.classList.add(subWordReveal);
    const containerEl = document.querySelector<HTMLElement>(
      siteApi.subtitlePopupSelector,
    );

    if (!containerEl) return;

    const popupEl = insertTranslationPopup(
      el,
      containerEl,
      siteApi.popupOffsetBottom,
      () => {
        onWordLeaveHandler(el);
      },
    );
    lastTranslationPopup = popupEl;
    lastHoveredElement = el;
    isVideoPaused = isVideoPaused || siteApi.pause();
    clearTimeout(videoPlayTimer);
    translateWord(el, popupEl);
  },

  onLeave: onWordLeaveHandler,
});

// Listen to changes in preferences and update lang and word settings.
document.addEventListener('prefs', (event: CustomEvent<Prefs>) => {
  const prefs = event.detail;
  updateWordsToHide(
    prefs.hideWords,
    prefs.wordCount,
    prefs.contractions,
    prefs.informal,
    prefs.hideType,
  );
  sourceLang = prefs.sourceLang;
  targetLang = prefs.targetLang;

  console.log(logPrefix, 'prefs updated:', prefs);
});

setInterval(() => {
  // Keep the position of the translation popup actual
  // because it has "position: fixed" and subtitles can be moved.
  adjustTranslationPopupPosition();
}, 100);

console.log(logPrefix, 'initialized');
