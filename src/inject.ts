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
  wordPrefix: '<span class="muddler-word">',
  wordPostfix: '</span>',
  processedWordPrefix: '<span class="muddler-word muddler-processed-word">',
  processedWordPostfix: '</span>',
};

const observer = createSubtitlesObserver(textNode => {
  const wildCarded = hideWords
    ? processSentence(textNode.textContent!, textProcessOptions).text
    : textNode.textContent!;
  const span = document.createElement("span");
  span.className = 'muddler-text';
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

addGlobalMouseOver('muddler-word', 'muddler-popup', async (el) => {
  el.classList.add('muddler-reveal');
  const pauseButton = document.querySelector<HTMLButtonElement>('.button-nfplayerPause');
  pauseButton?.click();

  const popupEl = insertPopup(el);

  translate(el.innerText, sourceLang, targetLang).then((translation) => {
    const html = getTranslationHTML(translation, sourceLang, targetLang);
    popupEl.querySelector('.muddler-loading')?.remove();
    popupEl.insertAdjacentHTML('beforeend', html);
  }).catch(error => {
    if (error.name !== 'AbortError') {
      throw error;
    }
  });
}, (el) => {
  const popupEl = document.querySelector('.muddler-popup');
  popupEl?.remove();

  el.classList.remove('muddler-reveal');
  cancelTranslate();
});

document.addEventListener('prefs', (event: CustomEvent<Prefs>) => {
  const prefs = event.detail;
  updateWordsToExclude(prefs.wordCount, prefs.contractions, prefs.informal);
  sourceLang = prefs.sourceLang;
  targetLang = prefs.targetLang;
  hideWords = prefs.hideWords;
});