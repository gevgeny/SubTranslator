import {
  getPopupHTML,
  getTranslationHTML,
  subLoadingClassName,
  subPopupClassName,
  subPopupWrapperClassName,
} from './markup';
// @ts-ignore
import styles from 'bundle-text:./translationPopup.css';
import { positionElement, toTrustedHTML } from './utils';
import { YaTranslateResponse, MyMemoryResponse } from './translate';

export function insertTranslationPopup(
  targetEl: HTMLElement,
  containerEl: HTMLElement,
  offsetBottom: number,
  onClose: () => void,
): HTMLElement {
  const shadowDomWrapperEl = document.createElement('div');
  shadowDomWrapperEl.classList.add(subPopupWrapperClassName);
  const shadow = shadowDomWrapperEl.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles;

  shadow.innerHTML = toTrustedHTML(getPopupHTML(offsetBottom));
  shadow.appendChild(style);
  containerEl.appendChild(shadowDomWrapperEl);

  const popupEl = shadow.querySelector(`.${subPopupClassName}`) as HTMLElement;
  positionElement(popupEl, targetEl, containerEl);
  popupEl.querySelector('.sub-tr-close-icon')?.addEventListener('click', onClose);
  return popupEl;
}

export function insertTranslationResult(
  translationPopupEl: HTMLElement,
  translation: YaTranslateResponse | MyMemoryResponse,
  sourceLang: string,
  targetLang: string,
) {
  const html = getTranslationHTML(translation, sourceLang, targetLang);
  const loaderEl = translationPopupEl.querySelector(`.${subLoadingClassName}`);
  loaderEl?.insertAdjacentHTML('afterend', toTrustedHTML(html));
  loaderEl?.remove();
}

export function hideTranslationPopup() {
  const popupEl = document.querySelector(`.${subPopupWrapperClassName}`);
  popupEl?.remove();
}
