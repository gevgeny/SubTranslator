import uniq from 'lodash-es/uniq';
import { fetchTextNodes } from './utils';

let isObserving = false;
let observer: MutationObserver | null = null;
let observingElement: Element | null = null;

function createTextMutationObserver(onTextAppear: (text: Text) => void): MutationObserver {
  return new MutationObserver((mutationsList: MutationRecord[]) => {
    const mutatedTextNodes = mutationsList
      .filter(m => m.type === 'childList' && m.addedNodes.length)
      .map((m) => Array.from(m.addedNodes).map(fetchTextNodes));
    const uniqTextNodes = uniq(mutatedTextNodes.flat().flat());
    uniqTextNodes.forEach(onTextAppear);
  });
}
/**
 * Starts to observe text mutation under the target element.
 * Restarts every time when target element is available again.
 * */
export default function startTextMutationObserver({
  getTargetElement,
  onTextAppear,
}: { getTargetElement: () => HTMLElement; onTextAppear: (text: Text) => void }
): void {
  const targetEl = getTargetElement();
  if (!observer) {
    observer = createTextMutationObserver(onTextAppear);
  }

  if (targetEl && !isObserving) {
    console.log('start observing subtitles');
    observingElement = targetEl;
    observer.observe(observingElement, { childList: true, subtree: true });
    isObserving = true;
  } else if (!targetEl && isObserving) {
    console.log('stop observing subtitles');
    observer?.disconnect();
    isObserving = false;
  } else if (targetEl && targetEl !== observingElement) {
    console.log('restart observing subtitles');
    observer.disconnect();
    observingElement = targetEl;
    observer.observe(observingElement, { childList: true, subtree: true });
  }
  // Restart observer if not started yet.
  // It is necessary if user changed a page with video and then came back
  setTimeout(() => { startTextMutationObserver({ getTargetElement, onTextAppear }); }, 200);
}