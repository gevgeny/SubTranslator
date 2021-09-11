import { TextProcessOptions } from './wrapSentenceWords';

interface TokenizeResult {
  tokens: string[];
  delimiters: string[];
}

/**
 * Split sentence into words and delimiters
 * */
export const tokenize = (text: string): TokenizeResult => {
  const word = /[a-z0-9'-]+/gi;
  const tokens = [];
  const delimiters = [];
  let item;
  let lastIndex = 0;

  while ((item = word.exec(text))) {
    tokens.push(item[0]);
    delimiters.push(text.substring(lastIndex, item.index));
    lastIndex = word.lastIndex;
  }
  delimiters.push(text.substring(lastIndex, text.length));

  return { tokens, delimiters };
};

/**
 * Merge tokens into sentence but add wrap the words.
 * */
export const detokenize = (
  tokens: { isHidden: boolean; word: string }[],
  delimiters: string[],
  wrapWord: (word: string) => string,
  wrapHiddenWord: (word: string) => string,
): string => {
  let result = '';

  for (let i = 0; i < tokens.length; i++) {
    result += delimiters[i];
    result += tokens[i].isHidden ? wrapHiddenWord(tokens[i].word) : wrapWord(tokens[i].word);
  }
  result += delimiters[delimiters.length - 1];

  return result;
};