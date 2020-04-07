export const defaultPrefs = {
  sourceLang: 'en',
  targetLang: 'ru',
  hideWords: true,
  contractions: true,
  informal: true,
  wordCount: 100,
};

export type Prefs = typeof defaultPrefs;

export function getPrefs(callback: (pref: Prefs) => void) {
  chrome.storage.sync.get(
    ['sourceLang', 'targetLang', 'contractions', 'wordCount', 'informal', 'hideWords'],
    (storagePrefs) => {
      callback({
        sourceLang: storagePrefs.sourceLang ?? defaultPrefs.sourceLang,
        targetLang: storagePrefs.targetLang ?? defaultPrefs.targetLang,
        contractions: storagePrefs.contractions ?? defaultPrefs.contractions,
        wordCount: storagePrefs.wordCount ?? defaultPrefs.wordCount,
        informal: storagePrefs.informal ?? defaultPrefs.informal,
        hideWords: storagePrefs.hideWords ?? defaultPrefs.hideWords,
      });
    },
  );
}

export function setPrefs(prefs: Prefs, callback: () => void) {
  chrome.storage.sync.set({
    sourceLang: prefs.sourceLang,
    targetLang: prefs.targetLang,
    hideWords: prefs.hideWords,
    contractions: prefs.contractions,
    informal: prefs.informal,
    wordCount: prefs.wordCount,
  }, () => {
    console.log('Settings saved');
    callback();
  });
}