declare module 'wink-pos-tagger' {
  export interface TaggedToken {
    value: string;
    tag: string;
    normal: string;
    pos: string;
    lemma: string;
  }
  interface Tagger {
    tagSentence(sentence: string): TaggedToken[];
    tagRawTokens(tokens: string[]): TaggedToken[];
  }
  const posTagger: () => Tagger;

  export default posTagger;
}
