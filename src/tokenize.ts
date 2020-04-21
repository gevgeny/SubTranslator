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
 * Merge tokens into sentence but add prefixes and postfixes around the words.
 * */
export const detokenize = (
  tokens: { isHidden: boolean; word: string }[],
  delimiters: string[],
  options: TextProcessOptions
): string => {
  let result = '';

  for (let i = 0; i < tokens.length; i++) {
    result += delimiters[i];
    result += tokens[i].isHidden
      ? `${options.hiddenWordPrefix}${tokens[i].word}${options.hiddenWordPostfix}`
      : `${options.wordPrefix}${tokens[i].word}${options.wordPostfix}`;
  }
  result += delimiters[delimiters.length - 1];

  return result;
};