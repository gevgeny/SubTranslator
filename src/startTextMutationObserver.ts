
let isObserving = false;
let observer: MutationObserver | null = null;
let observingElement: Element | null = null;

function getTextNodesUnderElement(el: Node): Node[] {
  let n;
  const a: Node[] = [];
  const walk = document.createTreeWalker(el,NodeFilter.SHOW_TEXT, null, false);

  do {
    n = walk.nextNode();
    if (n) {
      a.push(n);
    }
  } while(n);

  return a;
}

function createTextMutationObserver(onTextAppear: (text: Text) => void): MutationObserver {
  return new MutationObserver((mutationsList: MutationRecord[]) => {
    const mutations = mutationsList.filter(m => m.type === 'childList' && m.addedNodes.length);
    mutations.forEach((mutation) => {
      if (mutation.target instanceof HTMLSpanElement) return;

      mutation.addedNodes.forEach(node => {
        const textNodes = getTextNodesUnderElement(node);
        textNodes.forEach(onTextAppear);
      });
    });
  });
}
/**
 * Starts to observe text mutation under the target element.
 * Restarts every time when target element is available again.
 * */
export default function startTextMutationObserver({
  targetElSelector,
  onTextAppear,
}: { targetElSelector: string; onTextAppear: (text: Text) => void }
): void {
  const targetEl = document.querySelector(targetElSelector);
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
  setTimeout(() => { startTextMutationObserver({ targetElSelector, onTextAppear }); }, 200);
}