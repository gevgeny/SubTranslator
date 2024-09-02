import { partition } from 'lodash-es';
import { Language } from './preferencePopup/languages';

interface DictionaryValue {
  code: string;
  text: string;
  tooltip: string;
}

interface DictionarySynonym {
  text: string;
  gen: DictionaryValue;
  pos: DictionaryValue;
}

interface DictionaryMeaning {
  text: string;
  gen: DictionaryValue;
  syn: DictionarySynonym[];
  pos: DictionaryValue;
}

interface DictionaryItem {
  text: string;
  pos: DictionaryValue;
  ts: string;
  tr: DictionaryMeaning[];
}

interface Dictionary {
  regular: DictionaryItem[];
}
interface YaTranslateResponse {
  [langKey: string]: Dictionary;
}

interface MyMemoryTranslationResponse {
  responseData: {
    translatedText: string;
  };
  matches: {
    translation: string;
    'created-by': string;
    quality: string;
  }[];
}

interface MyMemoryResponse {
  text: string;
  translations: string[];
}

interface GoogleTranslateResponse {
  sentences: {
    orig: string;
    trans: string;
  }[];
  dict: {
    pos: string;
    base_form: string;
    terms: string[];
  }[];
}

export interface Translation {
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
      values: response.matches
        .filter(
          (match) =>
            (match['created-by'] === 'MateCat' || match['created-by'] === 'Wikipedia') &&
            match.quality !== '0',
        )
        .map((matches) => matches.translation),
    },
  ];
}

async function myMemoryTranslate(
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

function fetchTranslationFromGoogleTranslateResponse(
  response: GoogleTranslateResponse,
): Translation[] {
  const fromSentences =
    response.sentences?.map((sentence) => ({
      text: sentence.orig,
      pos: '',
      transcription: '',
      values: [sentence.trans],
    })) ?? [];

  const fromDict =
    response.dict?.map((translation) => ({
      text: translation.base_form,
      pos: translation.pos,
      transcription: '',
      values: translation.terms,
    })) ?? [];

  return [...fromSentences, ...fromDict];
}

async function googleTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<Translation[]> {
  googleTranslateController = new AbortController();
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&dt=t&dt=bd&dj=1&q=${text}&tl=${targetLang}`;
    const response = await fetch(url, { signal: googleTranslateController.signal });
    if (!response.ok) throw new Error('Failed to google translate');

    return fetchTranslationFromGoogleTranslateResponse(await response.json());
  } catch (error) {
    return [];
  }
}

export async function translate(
  text: string,
  sourceLang: Language,
  targetLang: Language,
): Promise<Translation[]> {
  let translations;
  const [translate1, translate2] =
    sourceLang === 'ru' || targetLang === 'ru'
      ? [yaTranslate, googleTranslate]
      : [googleTranslate, yaTranslate];

  translations = await translate1(text, sourceLang, targetLang);

  if (!translations?.length) {
    translations = await translate2(text, sourceLang, targetLang);
  }

  if (!translations?.length) {
    translations = await myMemoryTranslate(text, sourceLang, targetLang);
  }

  return translations;
}

export function cancelTranslate(): void {
  yaTranslateController?.abort();
  myMemoryTranslateController?.abort();
}
