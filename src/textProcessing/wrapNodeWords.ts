import { detokenize, tokenize } from './tokenize';
import posTagger from 'wink-pos-tagger';
import tokens from './tokens.json';

export interface ProcessResult {
  initialText: string;
  text: string;
}

export interface TextProcessOptions {
  wordPrefix: string;
  wordPostfix: string;
  hiddenWordPrefix: string;
  hiddenWordPostfix: string;
}

export interface WordMask {
  rect: DOMRect;
  word: string;
  isHidden: boolean;
}

let wordsToHide: Set<string> = new Set();
let hideAllWords = false;

export const updateWordsToHide = (
  shouldHideWords: boolean,
  count: number,
  includeContractions: boolean,
  includeInformalContractions: boolean,
  hideType: 'most-common' | 'all',
) => {
  hideAllWords = shouldHideWords && hideType === 'all';
  if (hideAllWords) return;
  if (!shouldHideWords) {
    wordsToHide = new Set();
    return;
  }

  const words: string[] = tokens.mostCommonWords
    .slice(0, count)
    .map((word: string) => word.toLowerCase());

  if (includeContractions) {
    words.push(...tokens.contractions.map((word: string) => word.toLowerCase()));
  }
  if (includeInformalContractions) {
    words.push(...tokens.informalContractions.map((word: string) => word.toLowerCase()));
  }

  wordsToHide = new Set(words);
};

const tagger = posTagger();

function hideWords(tokens: string[]) {
  return tagger.tagRawTokens(tokens).map((token) => {
    if (hideAllWords || wordsToHide.has(token.lemma || token.normal)) {
      return { isHidden: true, word: token.value };
    }
    return { isHidden: false, word: token.value };
  });
}

/**
 * Wrap words in the sentence in accordance with options
 * */
export const wrapNodeWords = (
  textNode: Text,
  wrapWord: (word: string) => string,
  wrapHiddenWord: (word: string) => string,
) => {
  const initialText = textNode.textContent! ?? '';
  const { tokens, delimiters } = tokenize(initialText);
  const processedTokens = hideWords(tokens);
  const text = detokenize(processedTokens, delimiters, wrapWord, wrapHiddenWord);

  return {
    text,
    initialText,
  } as ProcessResult;
};

export const maskTextWords = (textNode: Text): WordMask[] => {
  const result = tokenize(textNode.textContent!);
  const processedTokens = hideWords(result.tokens);

  return processedTokens.flatMap((token, i) => {
    const range = new Range();
    range.setStart(textNode, result.indices[i]);
    range.setEnd(textNode, result.indices[i] + token.word.length);
    const rects = Array.from(range.getClientRects());

    return rects.map((rect) => ({ rect, word: token.word, isHidden: token.isHidden }));
  });
};
