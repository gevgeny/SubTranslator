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
  regular: DictionaryItem[]
}
export interface DictionaryResponse {
  [langKey: string] : Dictionary
}

let controller: AbortController;

export async function translate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<DictionaryResponse> {

  controller = new AbortController();
  const url = `https://dictionary.yandex.net/dicservice.json/lookupMultiple?text=${text}&dict=${sourceLang}.syn%2Cen.ant%2Cen.deriv%2C${sourceLang}-${targetLang}.regular&flags=103`;
  return fetch(url, { signal: controller.signal }).then(response => response.json());
}

export function cancelTranslate() {
  controller?.abort();
}

export const languages = {
  'az': 'Azerbaijan',
  'ml': 'Malayalam',
  'sq': 'Albanian',
  'mt': 'Maltese',
  'am': 'Amharic',
  'mk': 'Macedonian',
  'en': 'English',
  'mi': 'Maori',
  'ar': 'Arabic',
  'mr': 'Marathi',
  'hy': 'Armenian',
  'mhr': 'Mari',
  'af': 'Afrikaans',
  'mn': 'Mongolian',
  'eu': 'Basque',
  'de': 'German',
  'ba': 'Bashkir',
  'ne': 'Nepali',
  'be': 'Belarusian',
  'no': 'Norwegian',
  'bn': 'Bengali',
  'pa': 'Punjabi',
  'my': 'Burmese',
  'pap': 'Papiamento',
  'bg': 'Bulgarian',
  'fa': 'Persian',
  'bs': 'Bosnian',
  'pl': 'Polish',
  'cy': 'Welsh',
  'pt': 'Portuguese',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'vi': 'Vietnamese',
  'ru': 'Russian',
  'ht': 'Haitian',
  'ceb': 'Cebuano',
  'gl': 'Galician',
  'sr': 'Serbian',
  'nl': 'Dutch',
  'si': 'Sinhala',
  'mrj': 'HillMari',
  'sk': 'Slovakian',
  'el': 'Greek',
  'sl': 'Slovenian',
  'ka': 'Georgian',
  'sw': 'Swahili',
  'gu': 'Gujarati',
  'su': 'Sundanese',
  'da': 'Danish',
  'tg': 'Tajik',
  'he': 'Hebre',
  'th': 'Thai',
  'yi': 'Yiddish',
  'tl': 'Tagalog',
  'id': 'Indonesian',
  'ta': 'Tamil',
  'ga': 'Irish',
  'tt': 'Tatar',
  'it': 'Italian',
  'te': 'Telugu',
  'is': 'Icelandic',
  'tr': 'Turkish',
  'es': 'Spanish',
  'udm': 'Udmurt',
  'kk': 'Kazakh',
  'uz': 'Uzbek',
  'kn': 'Kannada',
  'uk': 'Ukrainian',
  'ca': 'Catalan',
  'ur': 'Urdu',
  'ky': 'Kyrgyz',
  'fi': 'Finnish',
  'zh': 'Chinese',
  'fr': 'French',
  'ko': 'Korean',
  'hi': 'Hindi',
  'xh': 'Xhosa',
  'hr': 'Croatian',
  'km': 'Khmer',
  'cs': 'Czech',
  'lo': 'Laotian',
  'sv': 'Swedish',
  'la': 'Latin',
  'gd': 'Scottish',
  'lv': 'Latvian',
  'et': 'Estonian',
  'lt': 'Lithuanian',
  'eo': 'Esperanto',
  'lb': 'Luxembourgish',
  'jv': 'Javanese',
  'mg': 'Malagasy',
  'ja': 'Japanese',
  'ms': 'Malay'
};