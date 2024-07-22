import { wrapSentenceWords, updateWordsToHide } from './textProcessing/wrapSentenceWords';
import addMouseEnterLeaveEventListeners from './addMouseEnterLeaveEventListeners';
import { translate, cancelTranslate } from './translate';
import { insertTranslationPopup, insertTranslationResult, hideTranslationPopup } from './translationPopup';
import { defaultPrefs, Prefs } from './preferencePopup/prefs';
import {
  subWordClassName,
  subContainerClassName,
  getTranslationHTML,
  subWordReveal,
  getSubtitlesWordHTML,
  getSubtitlesHiddenWordHTML, subPopupWrapperClassName,
} from './markup';
import startTextMutationObserver from './startTextMutationObserver';
import { getSiteSpecificApi } from './siteApi';
import { fetchTextNodes, logPrefix } from './utils';
import { tokenize } from "./textProcessing/tokenize";


const siteApi = getSiteSpecificApi(location.host);
let sourceLang: string = defaultPrefs.sourceLang;
let targetLang: string = defaultPrefs.targetLang;


// const subtitleTexts = new WeakMap<Text, string | null>();
// const subtitleRecs = new WeakMap<Text, DOMRect[]>();
const subtitleMasks = new Map<Text, { masks: HTMLElement[], text: string}>();

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

console.log(logPrefix, 'initialized');

function getTextNodeWordRects(textNode: Text) {
  const result = tokenize(textNode.textContent!);

  return result.tokens.flatMap((token, i) => {
    const range = new Range();
    range.setStart(textNode, result.indices[i]);
    range.setEnd(textNode, result.indices[i] + token.length);

    return Array.from(range.getClientRects());
  });
}

function insertTextMasks(targetElement: HTMLElement, rects: DOMRect[]) {
  const targetElementRect = targetElement.getBoundingClientRect();
  const maskElements: HTMLElement[] = [];

  rects.forEach(rect => {
    const maskElement = document.createElement('div');
    maskElement.classList.add('sub-tr-mask-rect');
    maskElement.style.position = 'absolute';
    maskElement.style.pointerEvents = 'auto';
    maskElement.style.left = `${rect.left - targetElementRect.left}px`;
    maskElement.style.top = `${rect.top - targetElementRect.top}px`;
    maskElement.style.width = `${rect.width}px`;
    maskElement.style.height = `${rect.height}px`;
    maskElement.style.border = '1px solid red';
    targetElement.appendChild(maskElement);
    maskElements.push(maskElement);
  });

  return maskElements;
}

function calculateMasks(subtitleElement: HTMLElement, textNode: Text) {
  const rects = getTextNodeWordRects(textNode);
  const masks = insertTextMasks(subtitleElement, rects);
  subtitleMasks.set(textNode, { masks, text: textNode.textContent! });
}

setInterval(() => {
  const subtitleElement = document.querySelector<HTMLElement>(siteApi.subtitleSelector);

  if (!subtitleElement) return;

  // Remove masks of text elements which are not in the DOM anymore
  subtitleMasks.forEach((value, key) => {
    if (!subtitleElement.contains(key)) {
      value.masks.forEach(mask => mask.remove());
      subtitleMasks.delete(key);
    }
  });

  // Make sure the subtitle element is not static because masks are positioned absolutely
  if (window.getComputedStyle(subtitleElement).getPropertyValue('position') === 'static') {
    subtitleElement.style.position = 'relative';
  }

  // Check if the text nodes in the subtitle element have changed
  // If yes, then calculate the masks for the new text nodes.
  fetchTextNodes(subtitleElement).forEach(textNode => {
    if (!subtitleMasks.has(textNode)) {
      // if new text node found then add it to the map and calculate the rects
      calculateMasks(subtitleElement, textNode);
    } else if (textNode.textContent !== subtitleMasks.get(textNode)?.text) {
      // if the text has changed, then remove the masks and recalculate the rects
      subtitleMasks.get(textNode)?.masks.forEach(mask => mask.remove());
      calculateMasks(subtitleElement, textNode);
    }
  });

}, 100);

// Observe subtitles change on a page and replace text nodes with hidden words
// or with just custom nodes to make translation on mouseover easier
// startTextMutationObserver({
//   subtitleSelector: siteApi.subtitleSelector,
//   onTextAppear(text) {
//     console.log('text', text);
//   }
//   // onTextAppear: processSubtitlesElement
// });

// Toggle the popup with translation on mouseenter/mouseleave a word in the subtitles.
addMouseEnterLeaveEventListeners({
  // targetElClassName: subWordClassName,
  selector: siteApi.subtitleSelector,
  ignoreElClassName: subPopupWrapperClassName,

  // Translate hovered word and show translation popup
  onEnter: (el: HTMLElement) => {
    console.log('hover', el);
    // subWordEl.classList.add(subWordReveal);
    // const containerEl = siteApi.getSubtitlePopupMountTarget();
    // const popupEl = insertTranslationPopup(subWordEl, containerEl);
    //
    // siteApi.pause();
    //
    // translate(subWordEl.innerText, sourceLang, targetLang).then((translation) => {
    //   const html = getTranslationHTML(translation, sourceLang, targetLang);
    //   insertTranslationResult(popupEl, html);
    // }).catch(error => {
    //   if (error.name !== 'AbortError') {
    //     throw error;
    //   }
    // });
  },

  // Hide translation popup
  onLeave: (el: HTMLElement) => {
    console.log('leave', el);
    // hideTranslationPopup();
    // subWordEl.classList.remove(subWordReveal);
    // cancelTranslate();
  },
});

// Listen to changes in preferences and update lang and word settings.
document.addEventListener('prefs', (event: CustomEvent<Prefs>) => {
  const prefs = event.detail;
  updateWordsToHide(
    prefs.hideWords, prefs.wordCount, prefs.contractions, prefs.informal, prefs.hideType
  );
  sourceLang = prefs.sourceLang;
  targetLang = prefs.targetLang;
});