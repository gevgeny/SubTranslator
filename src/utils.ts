export function isVisible(el?: HTMLElement | null) {
  if (!el) return false;

  const style = window.getComputedStyle(el);
  return  style.width !== '0' &&
    style.height !== '0' &&
    style.opacity !== '0' &&
    style.display!=='none' &&
    style.visibility!== 'hidden';
}

export function injectCss(path: string): void {
  const link = document.createElement('link');
  link.href = chrome.extension.getURL(path);
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.getElementsByTagName('head')[0].appendChild(link);
}

export async function injectJs(path: string): Promise<void> {
  return new Promise((resolve) => {
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