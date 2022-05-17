import {
  DictionaryResponse,
  isTranslationResult,
  TranslationResult,
} from './translate';

export const popupWidth = 200;
export const popupHeight = 150;
export const popupOffset = 3;
export const subContainerClassName = 'sub-tr-text';
export const subWordClassName = 'sub-tr-word';
export const subProcessedWordClassName = 'sub-tr-processed-word';
export const subPopupWrapperClassName = 'sub-tr-popup-wrapper';
export const subPopupClassName = 'sub-tr-popup';
export const subWordReveal = 'sub-tr-reveal';
export const subLoadingClassName = 'sub-tr-loading';
const spinnerHTML = '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';


export function getSubtitlesWordHTML(word: string) {
  return `<span class="${subWordClassName}">${word}</span>`
}

export function getSubtitlesHiddenWordHTML(word: string) {
  return `<span class="${subWordClassName} ${subProcessedWordClassName}">${word}</span>`
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
  if (isTranslationResult((dictResponse))) {
    return `
      <div class="sub-tr-popup-content">
        <div class="sub-tr-dict">
          <div class="sub-tr-dict-item">
            <div class="sub-tr-dict-item-title">
              <span class="sub-tr-dict-item-text">${dictResponse.text}</span>
            </div>
            <ol class="sub-tr-dict-meaning">
            ${(dictResponse.translations).map(tr => `
              <li class="sub-tr-dict-meaning-item">${tr}</li>
            `).join('')}
            </ol>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="sub-tr-popup-content">
      <div class="sub-tr-dict">
        ${dictResponse[`${sourceLang}-${targetLang}`].regular.map(item => `
          <div class="sub-tr-dict-item">
            <div class="sub-tr-dict-item-title">
              <span class="sub-tr-dict-item-text">${item.text ?? ''}</span>
              <span class="sub-tr-dict-item-ts">${item.ts ? `[${item.ts}]` : ''}</span>
              <span class="sub-tr-dict-item-pos">${item.pos?.text ?? ''}</span>
            </div>
            <ol class="sub-tr-dict-meaning">
            ${(item.tr ?? []).map(tr => `
              <li class="sub-tr-dict-meaning-item">${tr?.text ?? ''}</li>
            `).join('')}
            </ol>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}