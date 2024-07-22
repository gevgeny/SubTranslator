import uniq from 'lodash-es/uniq';
import { fetchTextNodes, logPrefix } from './utils';

let isObserving = false;
let observer: MutationObserver | null = null;
let observingElement: Element | null = null;

/**
 * Starts to observe text mutation under the target element.
 * Restarts every time when target element is available again.
 * */
export default function startTextMutationObserver({
  subtitleSelector,
  onTextAppear,
}: { subtitleSelector: string; onTextAppear: (text: Text) => void }
): void {
  const targetEl = document.querySelector<HTMLElement>(subtitleSelector);
  if (!observer) {
    observer = createTextMutationObserver(onTextAppear);
  }

  if (targetEl && !isObserving) {
    console.log(logPrefix, 'start observing subtitles', targetEl);
    observingElement = targetEl;
    observer.observe(observingElement, { childList: true, subtree: true });
    isObserving = true;
  } else if (!targetEl && isObserving) {
    console.log(logPrefix, 'stop observing subtitles');
    observer?.disconnect();
    isObserving = false;
  } else if (targetEl && targetEl !== observingElement) {
    console.log(logPrefix, 'restart observing subtitles');
    observer.disconnect();
    observingElement = targetEl;
    observer.observe(observingElement, { childList: true, subtree: true });
  }
  // Restart observer if not started yet.
  // It is necessary if user changed a page with video and then came back
  setTimeout(() => { startTextMutationObserver({ subtitleSelector, onTextAppear }); }, 200);
}

function createTextMutationObserver(onTextAppear: (text: Text) => void): MutationObserver {
  return new MutationObserver((mutationsList: MutationRecord[]) => {
    console.log('MutationObserver', mutationsList);
    const mutatedTextNodes = mutationsList
      .filter(m => m.type === 'childList' && m.addedNodes.length)
      .map((m) => Array.from(m.addedNodes).map(fetchTextNodes));
    const uniqTextNodes = uniq(mutatedTextNodes.flat().flat());
    uniqTextNodes.forEach(onTextAppear);
  });
}
