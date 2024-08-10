import { DictionaryResponse, isTranslationResult, TranslationResult } from './translate';
import { WordMask } from './textProcessing/wrapNodeWords';

export const popupWidth = 240;
export const popupHeight = 120;
export const popupVerticalOffset = 3;
export const subContainerClassName = 'sub-tr-text';
export const subWordClassName = 'sub-tr-word';
export const subWordMaskClassName = 'sub-tr-mask';
export const subWordMaskHiddenClassName = 'sub-tr-mask-hidden';
export const subWordHiddenClassName = 'sub-tr-word-hidden';
export const subPopupWrapperClassName = 'sub-tr-popup-wrapper';
export const subPopupClassName = 'sub-tr-popup';
export const subWordReveal = 'sub-tr-reveal';
export const subLoadingClassName = 'sub-tr-loading';
const spinnerHTML =
  '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';

export function getSubtitlesWordHTML(word: string) {
  return `<span class="${subWordClassName}">${word}</span>`;
}

export function getSubtitlesHiddenWordHTML(word: string) {
  return `<span class="${subWordClassName} ${subWordHiddenClassName}">${word}</span>`;
}

export function getPopupHTML() {
  return `
    <div class="${subPopupClassName}" style="width: ${popupWidth}px; height: ${popupHeight}px;">
      <div class="${subLoadingClassName}">
        ${spinnerHTML}
      </div>
    </div>
  `;
}

export function getTranslationHTML(
  dictResponse: DictionaryResponse | TranslationResult,
  sourceLang: string,
  targetLang: string,
) {
  if (isTranslationResult(dictResponse)) {
    return `
      <div class="sub-tr-popup-content">
        <div class="sub-tr-dict">
          <div class="sub-tr-dict-item">
            <div class="sub-tr-dict-item-title">
              <span class="sub-tr-dict-item-text">${dictResponse.text}</span>
            </div>
            <ol class="sub-tr-dict-meaning">
            ${dictResponse.translations
              .map((tr) => `<li class="sub-tr-dict-meaning-item">${tr}</li>`)
              .join('')}
            </ol>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="sub-tr-popup-content">
      <div class="sub-tr-dict">
        ${dictResponse[`${sourceLang}-${targetLang}`].regular
          .map(
            (item) => `
          <div class="sub-tr-dict-item">
            <div class="sub-tr-dict-item-title">
              <span class="sub-tr-dict-item-text">${item.text ?? ''}</span>
              <span class="sub-tr-dict-item-ts">${item.ts ? `[${item.ts}]` : ''}</span>
              <span class="sub-tr-dict-item-pos">${item.pos?.text ?? ''}</span>
            </div>
            <ol class="sub-tr-dict-meaning">
            ${(item.tr ?? [])
              .map(
                (tr) => `<li class="sub-tr-dict-meaning-item">${tr?.text ?? ''}</li>
            `,
              )
              .join('')}
            </ol>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  `;
}

export function getWordMaskHTML(targetElementRect: DOMRect, wordMask: WordMask) {
  const { rect, word, isHidden } = wordMask;

  return `
    <div
      class="${subWordMaskClassName} ${isHidden ? subWordMaskHiddenClassName : ''}"
      data-word="${word}" 
      style=" 
        top: ${rect.top - targetElementRect.top + 2}px;
        left: ${rect.left - targetElementRect.left}px;  
        width: ${rect.width}px; 
        height: ${rect.height - 2}px;
      "/>
  `;
}

export function getWordWrapperHTML(word: string) {
  return `
    <span class="${subContainerClassName}">${word}</span>
  `;
}
