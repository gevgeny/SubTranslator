import {
  getPopupHTML, popupHeight, popupWidth, subLoadingClassName, subPopupClassName
} from './markup';

export function insertTranslationPopup(
  targetEl: HTMLElement,
  containerEl: HTMLElement,
): HTMLElement {
  const html = getPopupHTML();
  const rect = targetEl.getBoundingClientRect();

  containerEl.insertAdjacentHTML('beforeend', html);
  const popupEl = document.querySelector(`.${subPopupClassName}`) as HTMLElement;
  popupEl.style.zIndex = '100';
  popupEl.style.left = `${rect.x - popupWidth / 2 + rect.width / 2}px`;
  popupEl.style.top = rect.y > popupHeight
    ? `${rect.y - popupHeight}px`
    : `${rect.y + rect.height}px`;

  return popupEl;
}

export function insertTranslationResult(
  translationPopupEl: HTMLElement,
  translatingHTML: string,
) {
  translationPopupEl.querySelector(`.${subLoadingClassName}`)?.remove();
  translationPopupEl.insertAdjacentHTML('beforeend', translatingHTML);
}

export function hideTranslationPopup() {
  const popupEl = document.querySelector(`.${subPopupClassName}`);
  popupEl?.remove();
}