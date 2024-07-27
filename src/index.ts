import {
  wrapNodeWords,
  updateWordsToHide,
  maskTextWords,
  WordMask,
} from "./textProcessing/wrapNodeWords";
import addMouseEnterLeaveEventListeners from "./addMouseEnterLeaveEventListeners";
import { translate, cancelTranslate } from "./translate";
import {
  insertTranslationPopup,
  insertTranslationResult,
  hideTranslationPopup,
} from "./translationPopup";
import { defaultPrefs, Prefs } from "./preferencePopup/prefs";
import {
  subWordClassName,
  subContainerClassName,
  getTranslationHTML,
  subWordReveal,
  getSubtitlesWordHTML,
  getSubtitlesHiddenWordHTML,
  subPopupWrapperClassName,
  getWordMaskHTML,
} from "./markup";
import startTextMutationObserver from "./startTextMutationObserver";
import { getSiteSpecificApi } from "./siteApi";
import { createElementFromHTML, fetchTextNodes, logPrefix } from "./utils";
import { tokenize } from "./textProcessing/tokenize";

const siteApi = getSiteSpecificApi(location.host);
let sourceLang: string = defaultPrefs.sourceLang;
let targetLang: string = defaultPrefs.targetLang;

const subtitleMasks = new Map<Text, HTMLElement[]>();

/**
 * Wraps words in the target text in separate tags.
 * */
function WrapWordsInTextElement(textNode: Text): void {
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
  const span = document.createElement("span");

  span.className = subContainerClassName;
  span.innerHTML = processedText;
  textNode.parentElement!.replaceChild(span, textNode);
}

export function insertWordMasksInDOM(targetElement: HTMLElement, wordMasks: WordMask[]) {
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
  if (window.getComputedStyle(containerEl).getPropertyValue("position") === "static") {
    containerEl.style.position = "relative";
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

console.log(logPrefix, "initialized");

// Observe subtitles change on a page and replace text nodes with hidden words
// or with just custom nodes to make translation on mouseover easier
if (siteApi.subtitleTransformType === "mask") {
  startTextMutationObserver({
    containerSelector: siteApi.subtitleSelector,
    onTextAdded(textNode) {
      console.log("appear", textNode);
      addWordMasks(textNode);
    },
    onTextRemoved(textNode) {
      removeWordMasks(textNode);
    },
    onTextChanged(textNode) {
      removeWordMasks(textNode);
      addWordMasks(textNode);
    },
  });
} else {
  startTextMutationObserver({
    containerSelector: siteApi.subtitleSelector,
    onTextAdded(textNode) {
      WrapWordsInTextElement(textNode);
    },
  });
}

// Toggle the popup with translation on mouseenter/mouseleave a word in the subtitles.
addMouseEnterLeaveEventListeners({
  // targetElClassName: subWordClassName,
  selector: siteApi.subtitleSelector,
  ignoreElClassName: subPopupWrapperClassName,

  // Translate hovered word and show translation popup
  onEnter: (el: HTMLElement) => {
    console.log("hover", el);
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
    console.log("leave", el);
    // hideTranslationPopup();
    // subWordEl.classList.remove(subWordReveal);
    // cancelTranslate();
  },
});

// Listen to changes in preferences and update lang and word settings.
document.addEventListener("prefs", (event: CustomEvent<Prefs>) => {
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
