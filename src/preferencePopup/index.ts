import tokens from '../textProcessing/tokens.json';
import languages from './languages';
import { getPrefs, Prefs, setPrefs } from './prefs';

const commonWordsRangeInputEl = document.querySelector<HTMLInputElement>('.commonWordsRangeInput')!;
const sourceLangSelectEl = document.querySelector<HTMLSelectElement>('.sourceLangSelect')!;
const targetLangSelectEl = document.querySelector<HTMLSelectElement>('.targetLangSelect')!;
const hideWordsInputEl = document.querySelector<HTMLInputElement>('.commonWordsInput')!;
const contractionsWordsInputEl = document.querySelector<HTMLInputElement>('.contractionsWordsInput')!;
const informalWordsInputEl = document.querySelector<HTMLInputElement>('.informalWordsInput')!;
const fieldsetEl = document.querySelector<HTMLFieldSetElement>('.fieldset')!;
const mostFrequentWordsInputEl = document.querySelector<HTMLInputElement>('.mostFrequentWordsInput')!;
const allWordsInputEl = document.querySelector<HTMLInputElement>('.allWordsInputInput')!;
const mostFrequentWordsFieldsetEl = document.querySelector<HTMLFieldSetElement>('.mostFrequentWordsFieldset')!;
const wordCountEl = document.querySelector<HTMLElement>('.wordCount')!;

const prefsState = {
  get targetLang(): string { return this._targetLang; },
  set targetLang(value: string) {
    this._targetLang = value;
    targetLangSelectEl.value = value;
  },

  get sourceLang(): string { return this._sourceLang; },
  set sourceLang(value: string) {
    this._sourceLang = value;
    sourceLangSelectEl.value = value;
  },

  get hideWords(): boolean { return this._hideWords; },
  set hideWords(value: boolean) {
    this._hideWords = value;
    hideWordsInputEl.checked = value;
    fieldsetEl.disabled = !value;
  },

  get contractions(): boolean { return this._contractions; },
  set contractions(value: boolean) {
    this._contractions = value;
    contractionsWordsInputEl.checked = value;
    this.updateWordCount();
  },

  get informal(): boolean { return this._informal; },
  set informal(value: boolean) {
    this._informal = value;
    informalWordsInputEl.checked = value;
    this.updateWordCount();
  },

  get wordCount(): number { return this._wordCount; },
  set wordCount(value: number) {
    this._wordCount = value;
    commonWordsRangeInputEl.value = value.toString();
    this.updateWordCount();
  },

  get hideType(): 'most-common' | 'all' { return this._hideType; },
  set hideType(value: 'most-common' | 'all') {
    console.log('value', value);
    this._hideType = value;
    if (value === 'all') {
      allWordsInputEl.checked = true;
      mostFrequentWordsFieldsetEl.disabled = true;
    } else {
      mostFrequentWordsInputEl.checked = true;
      mostFrequentWordsFieldsetEl.disabled = false;
    }
    this.updateWordCount();
  },

  updateWordCount() {
    if (this.hideType === 'all') {
      wordCountEl.innerHTML = 'All';
      return;
    }

    wordCountEl.innerHTML = (
      this.wordCount +
      (this.contractions ? tokens.contractions.length : 0) +
      (this.informal ? tokens.informalContractions.length : 0)
    ).toString();
  }
} as Prefs;

function applyPrefs(): void {
  getPrefs((storagePrefs) => {
    prefsState.targetLang = storagePrefs.targetLang;
    prefsState.sourceLang = storagePrefs.sourceLang;
    prefsState.contractions = storagePrefs.contractions;
    prefsState.wordCount = storagePrefs.wordCount;
    prefsState.informal = storagePrefs.informal;
    prefsState.hideWords = storagePrefs.hideWords;
    prefsState.hideType = storagePrefs.hideType;
  });
}

function sendPrefsUpdate(): void {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id!, { from: 'popup' }, () => ({ }));
  });
}

function savePrefs(): void {
  setPrefs(prefsState, sendPrefsUpdate);
}

function addLanguages(): void {
  Object.entries(languages).sort(([, value1], [, value2]) => {
    if (value1 < value2) return -1;
    if (value1 > value2) return 1;
    return 0;
  }).forEach(([key, value]) => {
    targetLangSelectEl.insertAdjacentHTML(
      'beforeend', `<option value="${key}">${value}</option>`
    );
    sourceLangSelectEl.insertAdjacentHTML(
      'beforeend', `<option value="${key}">${value}</option>`
    );
  });
}

addLanguages();
applyPrefs();

sourceLangSelectEl.addEventListener('change', (event: Event) => {
  prefsState.sourceLang = (event.target as HTMLInputElement).value;
  savePrefs();
});
targetLangSelectEl.addEventListener('change', (event: Event) => {
  prefsState.targetLang = (event.target as HTMLInputElement).value;
  savePrefs();
});
hideWordsInputEl.addEventListener('change', (event: Event) => {
  prefsState.hideWords = (event.target as HTMLInputElement).checked;
  savePrefs();
});
contractionsWordsInputEl.addEventListener('change', (event: Event) => {
  prefsState.contractions = (event.target as HTMLInputElement).checked;
  savePrefs();
});
informalWordsInputEl.addEventListener('change', (event: Event) => {
  prefsState.informal = (event.target as HTMLInputElement).checked;
  savePrefs();
});
commonWordsRangeInputEl.addEventListener('input', (event: Event) => {
  prefsState.wordCount = parseInt((event.target as HTMLInputElement).value, 10);
});
commonWordsRangeInputEl.addEventListener('change', (event: Event) => {
  prefsState.wordCount = parseInt((event.target as HTMLInputElement).value, 10);
  savePrefs();
});
allWordsInputEl.addEventListener('change', (event: Event) => {
  if ((event.target as HTMLInputElement).checked) {
    prefsState.hideType = 'all';
    savePrefs();
  }
});
mostFrequentWordsInputEl.addEventListener('change', (event: Event) => {
  if ((event.target as HTMLInputElement).checked) {
    prefsState.hideType = 'most-common';
    savePrefs();
  }
});
