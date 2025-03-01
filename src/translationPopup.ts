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
import { Translation } from './types';

export function insertTranslationPopup(
  targetEl: HTMLElement,
  containerEl: HTMLElement,
  offsetBottom: number,
  onClose: () => void,
  onSettingsOpen: () => void,
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
  popupEl
    .querySelector('.sub-tr-settings-icon')
    ?.addEventListener('click', onSettingsOpen);
  return popupEl;
}

export function insertTranslationResult(
  translationPopupEl: HTMLElement,
  translations: Translation[],
) {
  const html = getTranslationHTML(translations);
  const loaderEl = translationPopupEl.querySelector(`.${subLoadingClassName}`);
  loaderEl?.insertAdjacentHTML('afterend', toTrustedHTML(html));
  loaderEl?.remove();
}

export function hideTranslationPopup() {
  const popupEl = document.querySelector(`.${subPopupWrapperClassName}`);
  popupEl?.remove();
}
