import debounce from 'lodash-es/debounce';

let selectedElement: HTMLElement | null = null;

/**
 * Custom 'mouseenter' and 'mouseleave' addEventListener.
 * By means of document.elementsFromPoint this implementation works even when other element overlaps the target or when .
 * */
export default function addMouseEnterLeaveEventListeners({
  selector, ignoreElClassName, onEnter, onLeave
}: {
  selector: string;
  ignoreElClassName: string;
  onEnter: (el: HTMLElement) => void;
  onLeave: (el: HTMLElement) => void;
}) {
  document.addEventListener('mousemove', debounce((event) => {
    const elementsUnderPointer = document.elementsFromPoint(event.clientX, event.clientY);
    const ignoreElement = elementsUnderPointer.find(e => e.classList.contains(ignoreElClassName)) as HTMLElement;

    if (ignoreElement) return;

    const element = elementsUnderPointer.find(e => e.matches(selector)) as HTMLElement | undefined;

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
  }, 10));
}
