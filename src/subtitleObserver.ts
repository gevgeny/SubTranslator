
function getTextNodesUnderElement(el: Node): Node[] {
  let n;
  const a: Node[] = [], walk = document.createTreeWalker(el,NodeFilter.SHOW_TEXT, null, false);
  do{
    n = walk.nextNode();
    if (n) {
      a.push(n);
    }
  } while(n);


  return a;
}

export default function createTextNodeObserver(onTextAppear: (text: Text) => void): MutationObserver {
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