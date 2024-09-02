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
export interface YaTranslateResponse {
  [langKey: string]: Dictionary;
}

export interface MyMemoryTranslationResponse {
  responseData: {
    translatedText: string;
  };
  matches: {
    translation: string;
    'created-by': string;
  }[];
}

export interface MyMemoryResponse {
  text: string;
  translations: string[];
}

export interface GoogleTranslateResponse {
  text: string;
  translations: string[];
}

interface Translation {
  text: string;
  pos: string;
  transcription: string;
  values: string[];
}

export function isTranslationResult(
  response: MyMemoryResponse | YaTranslateResponse,
): response is MyMemoryResponse {
  return 'translations' in response;
}

let yaTranslateController: AbortController;
let googleTranslateController: AbortController;
let myMemoryTranslateController: AbortController;

function fetchTranslationFromMyMemoryResponse(
  text: string,
  response: MyMemoryTranslationResponse,
) {
  return [
    {
      pos: '',
      transcription: '',
      text,
      values: response.matches.map((matches) => matches.translation),
    },
  ];
}

async function nyMemoryTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<Translation[]> {
  myMemoryTranslateController = new AbortController();
  try {
    const url = `https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url, { signal: myMemoryTranslateController.signal });
    if (!response.ok) throw new Error('Failed to fetch translation');
    return fetchTranslationFromMyMemoryResponse(text, await response.json());
  } catch (error) {
    return [];
  }
}

function fetchTranslationFromYaTranslateResponse(
  sourceLang: string,
  targetLang: string,
  response: YaTranslateResponse,
): Translation[] {
  console.log('ya:', response);
  return response?.[`${sourceLang}-${targetLang}`]?.regular.map((item) => ({
    text: item.text,
    pos: item.pos?.text,
    transcription: item.ts,
    values: item.tr.map((tr) => tr.text),
  }));
}

async function yaTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<Translation[] | null> {
  yaTranslateController = new AbortController();
  try {
    const url = `https://dictionary.yandex.net/dicservice.json/lookupMultiple?text=${text}&dict=${sourceLang}.syn%2Cen.ant%2Cen.deriv%2C${sourceLang}-${targetLang}.regular&flags=103`;
    const response = await fetch(url, { signal: yaTranslateController.signal });
    if (!response.ok) throw new Error('Failed to yanex translate');

    return fetchTranslationFromYaTranslateResponse(
      sourceLang,
      targetLang,
      await response.json(),
    );
  } catch (error) {
    return null;
  }
}

async function googleTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<GoogleTranslateResponse | null> {
  googleTranslateController = new AbortController();
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&dt=t&dt=bd&dj=1&q=${text}&tl=${targetLang}`;
    const response = await fetch(url, { signal: googleTranslateController.signal });
    if (!response.ok) throw new Error('Failed to google translate');

    return response.json();
  } catch (error) {
    return null;
  }
}

export async function translate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<Translation[]> {
  const translations = await yaTranslate(text, sourceLang, targetLang);

  if (!translations?.length) {
    return nyMemoryTranslate(text, sourceLang, targetLang);
  }

  return translations;
}

export function cancelTranslate(): void {
  yaTranslateController?.abort();
  myMemoryTranslateController?.abort();
}
