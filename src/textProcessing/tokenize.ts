interface TokenizeResult {
  tokens: string[];
  indices: number[];
  delimiters: string[];
}

/**
 * Split sentence into words and delimiters
 * */
export const tokenize = (text: string): TokenizeResult => {
  // regexp to match words on any language
  const word = /[\p{L}0-9'-]+/giu;
  const tokens = [];
  const indices = [];
  const delimiters = [];
  let item;
  let lastIndex = 0;

  while ((item = word.exec(text))) {
    tokens.push(item[0]);
    indices.push(item.index);
    delimiters.push(text.substring(lastIndex, item.index));
    lastIndex = word.lastIndex;
  }
  delimiters.push(text.substring(lastIndex, text.length));

  return { tokens, delimiters, indices };
};

/**
 * Merge tokens into sentence and wrap the words.
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