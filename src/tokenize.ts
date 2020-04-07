import {TextProcessOptions} from "./processSentence";

interface TokenizeResult {
  tokens: string[],
  delimiters: string[]
}

export const tokenize = (text: string): TokenizeResult => {
  const word = /[a-z0-9'\-]+/gi;
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

  return { tokens, delimiters};
};

export const detokenize = (
  tokens: { isProcessed: boolean, word: string }[],
  delimiters: string[],
  options: TextProcessOptions
): string => {
  let result = '';

  for (let i = 0; i < tokens.length; i++) {
    result += delimiters[i];
    result += tokens[i].isProcessed
      ? `${options.processedWordPrefix}${tokens[i].word}${options.processedWordPostfix}`
      : `${options.wordPrefix}${tokens[i].word}${options.wordPostfix}`;
  }
  result += delimiters[delimiters.length - 1];

  return result;
};