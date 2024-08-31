import { popupHeight, popupVerticalOffset, popupWidth } from './markup';
import debounce from 'lodash-es/debounce';

export const logPrefix = '\u001b[1;36m[Spotlight Lingo \uD83C\uDF0E]';

export function createElementFromHTML(htmlString: string) {
  const div = document.createElement('div');
  div.innerHTML = toTrustedHTML(htmlString.trim());
  return div.firstChild as HTMLElement;
}

export function isVisible(el?: HTMLElement | null) {
  if (!el) return false;

  const style = window.getComputedStyle(el);
  return (
    style.width !== '0' &&
    style.height !== '0' &&
    style.opacity !== '0' &&
    style.display !== 'none' &&
    style.visibility !== 'hidden'
  );
}

export function injectCss(path: string): void {
  const link = document.createElement('link');
  link.href = chrome.runtime.getURL(path);
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.getElementsByTagName('head')[0].appendChild(link);
}

export async function injectJs(path: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(path);
    s.onload = function () {
      (this as HTMLScriptElement).remove();
      resolve();
    };
    (document.head || document.documentElement).appendChild(s);
  });
}

export function fetchTextNodes(node: Node | Text): Text[] {
  if (node instanceof Text) return [node];

  const result: Text[] = [];
  const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  let textNode: Text | null = null;

  do {
    textNode = walk.nextNode() as Text;
    if (textNode) {
      result.push(textNode);
    }
  } while (textNode);

  return result;
}

/**
 * Positions an element relative to the anchor element.
 * */
export function positionElement(
  element: HTMLElement,
  anchorElement: HTMLElement,
  fitElement: HTMLElement,
) {
  const gap = 5;
  const anchorElementRect = anchorElement.getBoundingClientRect();
  const fitElementRect = fitElement.getBoundingClientRect();
  let left = anchorElementRect.x - popupWidth / 2 + anchorElementRect.width / 2;
  const top =
    anchorElementRect.y > popupHeight
      ? anchorElementRect.y - popupHeight - popupVerticalOffset
      : anchorElementRect.y + anchorElementRect.height + popupVerticalOffset;

  if (left < fitElementRect.x) {
    left = fitElementRect.x + gap;
  }
  if (left + popupWidth > fitElementRect.x + fitElementRect.width) {
    left = fitElementRect.x + fitElementRect.width - popupWidth - gap;
  }

  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

let stopScrollPosition: number | null = null;

window.addEventListener('scroll', (e: Event) => {
  if (stopScrollPosition !== null) {
    window.scrollTo(window.scrollX, stopScrollPosition);
    e.stopImmediatePropagation();
  }
});

export function disableScroll() {
  stopScrollPosition = window.scrollY;
}

export function enableScroll() {
  stopScrollPosition = null;
}

/**
 * Custom 'mouseenter' and 'mouseleave' addEventListener.
 * By means of document.elementsFromPoint this implementation works even when other element overlaps the target or when .
 * */
export default function addMouseEnterLeaveEventListeners({
  selector,
  ignoreElClassName,
  onEnter,
  onLeave,
}: {
  selector: string;
  ignoreElClassName: string;
  onEnter: (el: HTMLElement) => void;
  onLeave: (el: HTMLElement) => void;
}) {
  let selectedElement: HTMLElement | null = null;

  document.addEventListener(
    'mousemove',
    debounce(({ clientX, clientY }) => {
      const elementsUnderPointer = document.elementsFromPoint(clientX, clientY);
      const ignoreElement = elementsUnderPointer.find((e) =>
        e.classList.contains(ignoreElClassName),
      ) as HTMLElement;

      if (ignoreElement) return;

      const element = elementsUnderPointer.find((e) => e.matches(selector)) as
        | HTMLElement
        | undefined;

      if (element && selectedElement !== element) {
        if (selectedElement) {
          onLeave(selectedElement);
        }
        onEnter(element);
        selectedElement = element;
      }
      if (!element && selectedElement) {
        onLeave(selectedElement);
        selectedElement = null;
      }
    }, 10),
  );
}

export function toTrustedHTML(htmlString: string) {
  // @ts-ignore
  const renderPolicy = window.trustedTypes.createPolicy('render-policy', {
    createHTML: (input: string) => input,
  });

  return renderPolicy.createHTML(htmlString);
}
