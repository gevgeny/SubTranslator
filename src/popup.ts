import tokens from "./tokens.json";
import { languages } from "./translate";
import { getPrefs, Prefs, setPrefs } from "./prefs";

const commonWordsRangeInputEl = document.querySelector<HTMLInputElement>('.commonWordsRangeInput')!
const sourceLangSelectEl = document.querySelector<HTMLSelectElement>('.sourceLangSelect')!;
const targetLangSelectEl = document.querySelector<HTMLSelectElement>('.targetLangSelect')!;
const hideWordsInputEl = document.querySelector<HTMLInputElement>('.commonWordsInput')!;
const contractionsWordsInputEl = document.querySelector<HTMLInputElement>('.contractionsWordsInput')!;
const informalWordsInputEl = document.querySelector<HTMLInputElement>('.informalWordsInput')!;
const fieldsetEl = document.querySelector<HTMLFieldSetElement>('.fieldset')!;
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
  updateWordCount() {
    console.log(this.wordCount +
    this.contractions ? tokens.contractions.length : 0 +
    this.informal ? tokens.informalContractions.length : 0);
    wordCountEl.innerHTML = (
      this.wordCount +
      (this.contractions ? tokens.contractions.length : 0) +
      (this.informal ? tokens.informalContractions.length : 0)
    ).toString();
  }
} as Prefs;

function applyPrefs() {
  getPrefs((storagePrefs) => {
    prefsState.targetLang = storagePrefs.targetLang;
    prefsState.sourceLang = storagePrefs.sourceLang;
    prefsState.contractions = storagePrefs.contractions;
    prefsState.wordCount = storagePrefs.wordCount;
    prefsState.informal = storagePrefs.informal;
    prefsState.hideWords = storagePrefs.hideWords;
  });
}

function savePrefs() {
  setPrefs(prefsState, sendPrefsUpdate);
}

function addLanguages() {
  Object.entries(languages).sort(([key1, value1], [key2, value2]) => {
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

function sendPrefsUpdate() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id!, {from: 'popup'}, () => {});
  });
}

addLanguages();
applyPrefs();

sourceLangSelectEl.addEventListener('change', (event: any) => {
  prefsState.sourceLang = event.target.value;
  savePrefs();
});
targetLangSelectEl.addEventListener('change', (event: any) => {
  prefsState.targetLang = event.target.value;
  savePrefs();
});
hideWordsInputEl.addEventListener('change', (event: any) => {
  prefsState.hideWords = event.target.checked;
  savePrefs();
});
contractionsWordsInputEl.addEventListener('change', (event: any) => {
  prefsState.contractions = event.target.checked;
  savePrefs();
});
informalWordsInputEl.addEventListener('change', (event: any) => {
  prefsState.informal = event.target.checked;
  savePrefs();
});
commonWordsRangeInputEl.addEventListener('input', (event: any) => {
  prefsState.wordCount = parseInt(event.target.value, 10);
});
commonWordsRangeInputEl.addEventListener('change', (event: any) => {
  prefsState.wordCount = parseInt(event.target.value, 10);
  savePrefs();
});