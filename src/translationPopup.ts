import { DictionaryResponse } from "./translate";



const popupWidth = 200;
const popupHeight = 150;

export function getPopupHTML(): string {
  return `
    <div class="muddler-popup" style="width: ${popupWidth}px; height: ${popupHeight}px;">
      <div class="muddler-loading">
        <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    </div>
  `;
}

export function getTranslationHTML(
  dictResponse: DictionaryResponse,
  sourceLang: string,
  targetLang: string,
): string {
  return `
    <div class="muddler-popup-content">
      <div class="muddler-dict">
        ${dictResponse[`${sourceLang}-${targetLang}`].regular.map(item => `
          <div class="muddler-dict-item">
            <div class="muddler-dict-item-title">
              <span class="muddler-dict-item-text">${item.text ?? ''}</span>
              <span class="muddler-dict-item-ts">[${item.ts ?? ''}]</span>
              <span class="muddler-dict-item-pos">${item.pos?.text ?? ''}</span>
            </div>
            <ol class="muddler-dict-meaning">
            ${(item.tr ?? []).map(tr => `
              <li class="muddler-dict-meaning-item">${tr?.text ?? ''}</li>
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
  const popupEl = document.querySelector('.muddler-popup') as HTMLElement;
  popupEl.style.zIndex = '100';
  popupEl.style.left = `${rect.x - popupWidth / 2 + rect.width / 2}px`;
  popupEl.style.top = rect.y > popupHeight
    ? `${rect.y - popupHeight}px`
    : `${rect.y + rect.height}px`;

  return popupEl;
}