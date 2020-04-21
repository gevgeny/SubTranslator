import {
  DictionaryResponse,
  isTranslationResult,
  TranslationResult,
} from './translate';

const popupWidth = 200;
const popupHeight = 150;

export function getPopupHTML(): string {
  return `
    <div class="sub-tr-popup" style="width: ${popupWidth}px; height: ${popupHeight}px;">
      <div class="sub-tr-loading">
        <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  `;
}

export function getTranslationHTML(
  dictResponse: DictionaryResponse | TranslationResult,
  sourceLang: string,
  targetLang: string,
): string {
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
              <span class="sub-tr-dict-item-ts">[${item.ts ?? ''}]</span>
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

export function insertPopup(targetEl: HTMLElement): HTMLElement {
  const html = getPopupHTML();
  const rect = targetEl.getBoundingClientRect();

  document.querySelector('.sizing-wrapper')!.insertAdjacentHTML('beforeend', html);
  const popupEl = document.querySelector('.sub-tr-popup') as HTMLElement;
  popupEl.style.zIndex = '100';
  popupEl.style.left = `${rect.x - popupWidth / 2 + rect.width / 2}px`;
  popupEl.style.top = rect.y > popupHeight
    ? `${rect.y - popupHeight}px`
    : `${rect.y + rect.height}px`;

  return popupEl;
}