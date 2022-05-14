import {
  getPopupHTML, popupHeight, popupOffset, popupWidth, subLoadingClassName, subPopupClassName, subPopupWrapperClassName
} from './markup';
import { popupCss, spinnerCss } from './styles';

export function insertTranslationPopup(
  targetEl: HTMLElement,
  containerEl: HTMLElement,
): HTMLElement {
  const html = getPopupHTML();
  const rect = targetEl.getBoundingClientRect();

  const shadowDomWrapperEl = document.createElement('div');
  console.log('shadowDomWrapperEl', shadowDomWrapperEl);
  shadowDomWrapperEl.classList.add(subPopupWrapperClassName);
  const shadow = shadowDomWrapperEl.attachShadow({ mode: 'open' });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const style = document.createElement('style');
  style.textContent = popupCss + spinnerCss;

  shadow.appendChild(style);
  shadow.appendChild(wrapper);
  shadow.appendChild(wrapper);
  containerEl.appendChild(shadowDomWrapperEl);
  const popupEl = wrapper.querySelector(`.${subPopupClassName}`) as HTMLElement;
  popupEl.style.left = `${rect.x - popupWidth / 2 + rect.width / 2}px`;
  popupEl.style.top = rect.y > popupHeight
    ? `${rect.y - popupHeight - popupOffset}px`
    : `${rect.y + rect.height + popupOffset}px`;

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