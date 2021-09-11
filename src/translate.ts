import { partition } from 'lodash-es';

export interface DictionaryValue {
  code: string;
  text: string;
  tooltip: string;
}

export interface DictionarySynonym {
  text: string;
  gen: DictionaryValue;
  pos: DictionaryValue;
}

export interface DictionaryMeaning {
  text: string;
  gen: DictionaryValue;
  syn: DictionarySynonym[];
  pos: DictionaryValue;
}

export interface DictionaryItem {
  text: string;
  pos: DictionaryValue;
  ts: string;
  tr: DictionaryMeaning[];
}

export interface Dictionary {
  regular: DictionaryItem[];
}
export interface DictionaryResponse {
  [langKey: string]: Dictionary;
}

export interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
  matches: {
    translation: string;
    'created-by': string;
  }[];
}

export interface TranslationResult {
  text: string;
  translations: string[];
}

export function isTranslationResult(response: TranslationResult | DictionaryResponse): response is TranslationResult {
  return 'translations' in response;
}

let dictionaryController: AbortController;
let translateController: AbortController;

function isDictionaryResultEmpty (
  sourceLang: string,
  targetLang: string,
  dict: DictionaryResponse,
): boolean {
  return (dict[`${sourceLang}-${targetLang}`]?.regular?.length ?? 0) === 0;
}
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  translateController = new AbortController();
  const url = `https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceLang}|${targetLang}`;
  const response = await fetch(url, { signal: translateController.signal });
  const result = await response.json() as TranslationResponse;
  const [matches1, matches2] = partition(result.matches, match => match['created-by'] === 'MT!');

  return { text, translations: [...matches1, ...matches2].map(match => match.translation) };

}

async function lookupDictionary(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<DictionaryResponse> {
  dictionaryController = new AbortController();
  const url = `https://dictionary.yandex.net/dicservice.json/lookupMultiple?text=${text}&dict=${sourceLang}.syn%2Cen.ant%2Cen.deriv%2C${sourceLang}-${targetLang}.regular&flags=103`;
  const response = await fetch(url, { signal: dictionaryController.signal });
  return response.json();
}

export async function translate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<DictionaryResponse | TranslationResult> {

  const dict = await lookupDictionary(text, sourceLang, targetLang);

  if (isDictionaryResultEmpty(sourceLang, targetLang, dict)) {
    return translateText(text, sourceLang, targetLang);
  }

  return dict;
}

export function cancelTranslate(): void {
  dictionaryController?.abort();
}