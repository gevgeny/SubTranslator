import { logPrefix } from '../utils';

export const defaultPrefs: Prefs = {
  sourceLang: 'en',
  targetLang: 'es',
  hideWords: false,
  hideType: 'most-common',
  contractions: true,
  informal: true,
  wordCount: 100,
};

export type Prefs = {
  sourceLang: string;
  targetLang: string;
  hideWords: boolean;
  hideType: 'most-common' | 'all';
  contractions: boolean;
  informal: boolean;
  wordCount: number;
};

export function getPrefs(callback: (pref: Prefs) => void) {
  chrome.storage.sync.get(
    [
      'sourceLang',
      'targetLang',
      'contractions',
      'wordCount',
      'informal',
      'hideWords',
      'hideType',
    ],
    (storagePrefs) => {
      callback({
        sourceLang: storagePrefs.sourceLang ?? defaultPrefs.sourceLang,
        targetLang: storagePrefs.targetLang ?? defaultPrefs.targetLang,
        contractions: storagePrefs.contractions ?? defaultPrefs.contractions,
        wordCount: storagePrefs.wordCount ?? defaultPrefs.wordCount,
        informal: storagePrefs.informal ?? defaultPrefs.informal,
        hideWords: storagePrefs.hideWords ?? defaultPrefs.hideWords,
        hideType: storagePrefs.hideType ?? defaultPrefs.hideType,
      });
    },
  );
}

export function setPrefs(prefs: Prefs, callback: () => void) {
  chrome.storage.sync.set(
    {
      sourceLang: prefs.sourceLang,
      targetLang: prefs.targetLang,
      hideWords: prefs.hideWords,
      contractions: prefs.contractions,
      informal: prefs.informal,
      wordCount: prefs.wordCount,
      hideType: prefs.hideType,
    },
    () => {
      console.log(logPrefix, 'Settings saved');
      callback();
    },
  );
}
