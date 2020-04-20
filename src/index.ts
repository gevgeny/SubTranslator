import {wrapSentenceWords, TextProcessOptions, updateWordsToHide} from "./wrapSentenceWords";
import addGlobalMouseOver from "./addGlobalMouseOver";
import {translate, cancelTranslate} from "./translate";
import { getTranslationHTML, insertPopup} from "./translationPopup";
import createTextNodeChangeObserver from "./subtitleObserver";
import {defaultPrefs, Prefs} from "./prefs";
console.log('index.ts');

let isObserving = false;
let observer: MutationObserver | null = null;
let observingElement: Element | null = null;
let sourceLang: string = defaultPrefs.sourceLang;
let targetLang: string = defaultPrefs.targetLang;
let hideWords: boolean = defaultPrefs.hideWords;

const textProcessOptions: TextProcessOptions = {
  wordPrefix: '<span class="sub-tr-word">',
  wordPostfix: '</span>',
  hiddenWordPrefix: '<span class="sub-tr-word sub-tr-processed-word">',
  hiddenWordPostfix: '</span>',
};

function observeSubtitles({ onTextAppear }: { onTextAppear: (text: Text) => void; }) {
  const el = document.querySelector('.player-timedtext');

  if (!observer) {
    observer = createTextNodeChangeObserver(onTextAppear);
  }

  if (el && !isObserving) {
    // Start observing subtitles
    console.log('start observing subtitles');
    observingElement = el;
    observer.observe(observingElement, { childList: true, subtree: true });
    isObserving = true;
  } else if (!el && isObserving) {
    // Stop observing subtitles
    console.log('stop observing subtitles');
    observer?.disconnect();
    isObserving = false;
  } else if (el && el !== observingElement) {
    // Restart observing subtitles
    console.log('restart observing subtitles');
    observer.disconnect();
    observingElement = el;
    observer.observe(observingElement, { childList: true, subtree: true });
  }
  setTimeout(() => { observeSubtitles({ onTextAppear }); }, 200);
}

function processSubtitlesElement(textNode: Text) {
  const processedText = wrapSentenceWords(textNode.textContent!, textProcessOptions).text;
  const span = document.createElement("span");

  span.className = 'sub-tr-text';
  span.innerHTML = processedText;
  textNode.parentElement!.replaceChild(span, textNode);
}

function updatePrefs (event: CustomEvent<Prefs>) {
  const prefs = event.detail;
  updateWordsToHide(
    prefs.hideWords, prefs.wordCount, prefs.contractions, prefs.informal
  );
  sourceLang = prefs.sourceLang;
  targetLang = prefs.targetLang;
}

function translateNodeTextAndShowTooltip(el: HTMLElement) {
  el.classList.add('sub-tr-reveal');
  const pauseButton = document.querySelector<HTMLButtonElement>('.button-nfplayerPause');
  pauseButton?.click();

  const popupEl = insertPopup(el);

  translate(el.innerText, sourceLang, targetLang).then((translation) => {
    const html = getTranslationHTML(translation, sourceLang, targetLang);
    popupEl.querySelector('.sub-tr-loading')?.remove();
    popupEl.insertAdjacentHTML('beforeend', html);
  }).catch(error => {
    if (error.name !== 'AbortError') {
      throw error;
    }
  });
}

function hidePopup(el: HTMLElement) {
  const popupEl = document.querySelector('.sub-tr-popup');
  popupEl?.remove();

  el.classList.remove('sub-tr-reveal');
  cancelTranslate();
}

// Observe subtitles change on a page and replace text nodes with hidden words
// or with just custom nodes to make translation on mouseover easier
observeSubtitles({
  onTextAppear: processSubtitlesElement
});

// Translate snd show translation popup on mouseover
//
// Since many elements on page may have "pointer-event: none"
// we cannot just listen mouse events directly on the text elements.
// So we use custom event delegation
addGlobalMouseOver({
  targetElClassName: 'sub-tr-word',
  ignoreElClassName: 'sub-tr-popup',
  onEnter: translateNodeTextAndShowTooltip,
  onLeave: hidePopup,
});

document.addEventListener('prefs', updatePrefs);