import {
  getPopupHTML,
  getTranslationHTML,
  subLoadingClassName,
  subPopupClassName,
  subPopupWrapperClassName,
} from './markup';
// @ts-ignore
import styles from 'bundle-text:./translationPopup.css';
import { positionElement } from './utils';
import { DictionaryResponse, TranslationResult } from './translate';

export function insertTranslationPopup(
  targetEl: HTMLElement,
  containerEl: HTMLElement,
): HTMLElement {
  const shadowDomWrapperEl = document.createElement('div');
  shadowDomWrapperEl.classList.add(subPopupWrapperClassName);
  const shadow = shadowDomWrapperEl.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = styles;

  shadow.innerHTML = getPopupHTML();
  shadow.appendChild(style);
  containerEl.appendChild(shadowDomWrapperEl);

  const popupEl = shadow.querySelector(`.${subPopupClassName}`) as HTMLElement;
  positionElement(popupEl, targetEl, containerEl);
  return popupEl;
}

export function insertTranslationResult(
  translationPopupEl: HTMLElement,
  translation: DictionaryResponse | TranslationResult,
  sourceLang: string,
  targetLang: string,
) {
  const html = getTranslationHTML(translation, sourceLang, targetLang);
  translationPopupEl.querySelector(`.${subLoadingClassName}`)?.remove();
  translationPopupEl.insertAdjacentHTML('beforeend', html);
}

export function hideTranslationPopup() {
  const popupEl = document.querySelector(`.${subPopupWrapperClassName}`);
  popupEl?.remove();
}
