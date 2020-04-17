import {detokenize, tokenize} from "./tokenize";
import posTagger from "wink-pos-tagger";
// @ts-ignore
import tokens from "./tokens.json";

export interface ProcessResult {
  initialText: string;
  text: string;
  processedWordCount: number;
  totalWordCount: number;
}

export interface TextProcessOptions {
  wordPrefix: string;
  wordPostfix: string;
  hiddenWordPrefix: string;
  hiddenWordPostfix: string;
}
let wordsToHide: Set<string> = new Set();

export const updateWordsToHide = (
  count: number,
  includeContractions: boolean,
  includeInformalContractions: boolean,
) => {
  const words: string[] = tokens
    .mostCommonWords.slice(0, count)
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

/**
 * Wrap words in the sentence in accordance with options
 * */
export const wrapSentenceWords = (
  sentence: string,
  options: TextProcessOptions,
): ProcessResult => {
  const { tokens, delimiters } = tokenize(sentence);

  let processedWordCount = 0;
  const processedTokens = tagger.tagRawTokens(tokens).map(token => {

    if (wordsToHide.has(token.lemma || token.normal)) {
      processedWordCount++;
      return { isHidden: true, word: token.value };
    }
    return { isHidden: false, word: token.value };
  });

  const text = detokenize(processedTokens, delimiters, options);

  return { text, processedWordCount, totalWordCount: tokens.length, initialText: sentence };
};