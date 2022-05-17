import {
  getPopupHTML, subLoadingClassName, subPopupClassName, subPopupWrapperClassName
} from './markup';
import { popupCss, spinnerCss } from './styles';
import { disableScroll, enableScroll, positionElement } from './utils';

export function insertTranslationPopup(
  targetEl: HTMLElement,
  containerEl: HTMLElement,
): HTMLElement {

  const shadowDomWrapperEl = document.createElement('div');
  shadowDomWrapperEl.classList.add(subPopupWrapperClassName);
  const shadow = shadowDomWrapperEl.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = popupCss + spinnerCss;

  shadow.innerHTML =  getPopupHTML();
  shadow.appendChild(style);
  containerEl.appendChild(shadowDomWrapperEl);

  const popupEl = shadow.querySelector(`.${subPopupClassName}`) as HTMLElement;
  positionElement(popupEl, targetEl, containerEl);
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
  const popupEl = document.querySelector(`.${subPopupWrapperClassName}`);
  popupEl?.remove();
}