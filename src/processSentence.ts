import {detokenize, tokenize} from "./tokenize";
import posTagger, { TaggedToken } from "wink-pos-tagger";
import tokens from "./tokens.json";

export interface ProcessResult {
  initialText: string;
  text: string;
  processedWordCount: number;
  totalWordCount: number;
}

export interface TextProcessOptions {
  wildcardWords: boolean;
  wordPrefix: string;
  wordPostfix: string;
  processedWordPrefix: string;
  processedWordPostfix: string;
}
let targetWords: Set<string> = new Set();

export const updateWordsToExclude = (
  targetWordCount: number,
  hasContraction: boolean,
  hasInformalContraction: boolean,
) => {
  const words: string[] = tokens
    .mostCommonWords.slice(0, targetWordCount)
    .map((word: string) => word.toLowerCase());

  if (hasContraction) {
    words.push(...tokens.contractions.map((word: string) => word.toLowerCase()));
  }
  if (hasInformalContraction) {
    words.push(...tokens.informalContractions.map((word: string) => word.toLowerCase()));
  }

  targetWords = new Set(words);
  console.log('targetWords', targetWords.size);
};

const tagger = posTagger();

const processWord = (
  targetWords: Set<string>,
  token: TaggedToken,
  options: TextProcessOptions,
): { isProcessed: boolean, word: string } => {
  const lemma = token.lemma || token.normal;

  if (!targetWords.has(lemma)) return { isProcessed: false, word: token.value };

  let processed = '';
  if (options.wildcardWords) {
    // TODO: optimize
    for (let char of token.value) {
      if (char === '\'') {
        processed += '\'';
      } else {
        processed += '*';
      }
    }
  } else {
    processed = token.value;
  }

  return { isProcessed: true, word: processed };

};

export const processSentence = (
  sentence: string,
  options: TextProcessOptions,
): ProcessResult => {
  const { tokens, delimiters } = tokenize(sentence);

  let processedWordCount = 0;
  const processedTokens = tagger.tagRawTokens(tokens).map(token => {
    const { word, isProcessed } = processWord(targetWords, token, options);
    if (isProcessed) {
      processedWordCount++;
    }
    return { word, isProcessed };
  });

  const text = detokenize(processedTokens, delimiters, options);

  return { text, processedWordCount, totalWordCount: tokens.length, initialText: sentence };
};