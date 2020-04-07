declare module 'wink-lemmatizer' {
  const lemmatize: {
    verb(word: string): string;
    noun(word: string): string;
    adjective(word: string): string;
  };

  export default lemmatize;
}

declare module 'react-window' {
  import { FC, CSSProperties } from 'react';

  export interface ListProps {
    itemData: any;
    height: number;
    itemCount: number;
    width?: number;
  }

  export const DynamicSizeList: FC<ListProps>;

  export interface RowProps<T> {
    data: T;
    index: number;
    style: CSSProperties;
  }

}


declare module 'wink-pos-tagger' {
  export interface TaggedToken {
    value: string;
    tag: string;
    normal: string;
    pos: string;
    lemma: string;
  }
  interface Tagger {
    tagSentence(sentence: string): TaggedToken[]
    tagRawTokens(tokens: string[]): TaggedToken[]
  }
  const posTagger: () => Tagger;

  export default posTagger;
}