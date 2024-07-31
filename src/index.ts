import {
  wrapNodeWords,
  updateWordsToHide,
  maskTextWords,
  WordMask,
} from './textProcessing/wrapNodeWords';
import addMouseEnterLeaveEventListeners from './addMouseEnterLeaveEventListeners';
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
  getTranslationHTML,
  subWordReveal,
  getSubtitlesWordHTML,
  getSubtitlesHiddenWordHTML,
  subPopupWrapperClassName,
  getWordMaskHTML,
  subWordMaskClassName,
} from './markup';
import startTextMutationObserver from './startTextMutationObserver';
import { getSiteSpecificApi } from './siteApi';
import { createElementFromHTML, logPrefix, positionElement } from './utils';
import debounce from 'lodash-es/debounce';

const siteApi = getSiteSpecificApi(location.host);
let sourceLang: string = defaultPrefs.sourceLang;
let targetLang: string = defaultPrefs.targetLang;

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
  const span = document.createElement('span');

  span.className = subContainerClassName;
  span.innerHTML = processedText;
  textNode.parentElement!.replaceChild(span, textNode);
}

function insertWordMasksInDOM(targetElement: HTMLElement, wordMasks: WordMask[]) {
  const targetElementRect = targetElement.getBoundingClientRect();
  const rectElements: HTMLElement[] = [];

  wordMasks.forEach((wordMask) => {
    const maskHTML = getWordMaskHTML(targetElementRect, wordMask);
    const maskElement = createElementFromHTML(maskHTML) as HTMLElement;
    targetElement.appendChild(maskElement);
    rectElements.push(maskElement);
  });

  return rectElements;
}

function addWordMasks(textNode: Text) {
  const containerEl = document.querySelector<HTMLElement>(
    siteApi.maskContainerSelector ?? siteApi.subtitleSelector,
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
  const popupWrapperEl = document.querySelector<HTMLElement>(`.${subPopupWrapperClassName}`);

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

// Toggle the popup with translation on mouseenter/mouseleave a word in the subtitles.
addMouseEnterLeaveEventListeners({
  selector: `.${subWordClassName}, .${subWordMaskClassName}`,
  ignoreElClassName: subPopupWrapperClassName,

  // Translate hovered word and show translation popup
  onEnter: (el: HTMLElement) => {
    console.log('onEnter', el);
    el.classList.add(subWordReveal);
    const containerEl = document.querySelector<HTMLElement>(siteApi.subtitlePopupSelector);

    if (!containerEl) return;

    const popupEl = insertTranslationPopup(el, containerEl);
    lastTranslationPopup = popupEl;
    lastHoveredElement = el;

    isVideoPaused = isVideoPaused || siteApi.pause();
    clearTimeout(videoPlayTimer);

    translate(el.dataset['word'] ?? el.innerText, sourceLang, targetLang)
      .then((translation) => {
        const html = getTranslationHTML(translation, sourceLang, targetLang);
        insertTranslationResult(popupEl, html);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          throw error;
        }
      });
  },

  // Hide translation popup
  onLeave: (el: HTMLElement) => {
    console.log('onLeave', el);
    hideTranslationPopup();
    el.classList.remove(subWordReveal);
    lastHoveredElement = null;
    lastTranslationPopup = null;
    cancelTranslate();
    playVideo();
  },
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
});

setInterval(() => {
  // Keep the position of the translation popup actual because it has "position: fixed"
  // and subtitles can be moved.
  adjustTranslationPopupPosition();
}, 200);

console.log(logPrefix, 'initialized');
