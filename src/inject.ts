import {processSentence, TextProcessOptions, updateWordsToExclude} from "./processSentence";
import addGlobalMouseOver from "./addGlobalMouseOver";
import {translate, cancelTranslate} from "./translate";
import { getTranslationHTML, insertPopup} from "./translationPopup";
import createSubtitlesObserver from "./subtitleObserver";
import {defaultPrefs, Prefs} from "./prefs";

let isObserving = false;

let sourceLang: string = defaultPrefs.sourceLang;
let targetLang: string = defaultPrefs.targetLang;
let hideWords: boolean = defaultPrefs.hideWords;

const textProcessOptions: TextProcessOptions = {
  wildcardWords: false,
  wordPrefix: '<span class="sub-tr-word">',
  wordPostfix: '</span>',
  processedWordPrefix: '<span class="sub-tr-word sub-tr-processed-word">',
  processedWordPostfix: '</span>',
};

const observer = createSubtitlesObserver(textNode => {
  const wildCarded = hideWords
    ? processSentence(textNode.textContent!, textProcessOptions).text
    : textNode.textContent!;
  const span = document.createElement("span");
  span.className = 'sub-tr-text';
  span.innerHTML = wildCarded;
  textNode.parentElement!.replaceChild(span, textNode);
});

function waitForSubtitles() {
  const el = document.querySelector('.player-timedtext');

  if (el && !isObserving) {
    console.log('start observing subtitles');
    observer.observe(document.querySelector('.player-timedtext')!, { childList: true, subtree: true });
    isObserving = true;
  } else if (!el) {
    isObserving = false;
  }
  setTimeout(waitForSubtitles, 200);
}

waitForSubtitles();

addGlobalMouseOver('sub-tr-word', 'sub-tr-popup', async (el) => {
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
}, (el) => {
  const popupEl = document.querySelector('.sub-tr-popup');
  popupEl?.remove();

  el.classList.remove('sub-tr-reveal');
  cancelTranslate();
});

document.addEventListener('prefs', (event: CustomEvent<Prefs>) => {
  const prefs = event.detail;
  updateWordsToExclude(prefs.wordCount, prefs.contractions, prefs.informal);
  sourceLang = prefs.sourceLang;
  targetLang = prefs.targetLang;
  hideWords = prefs.hideWords;
});