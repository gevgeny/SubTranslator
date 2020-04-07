
function textNodesUnder(el: Node): Node[] {
  let n, a = [], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT, null, false);
  while(n = walk.nextNode()) a.push(n);

  return a;
}

export default function createSubtitlesObserver(callback: (text: Text) => void): MutationObserver {
  return new MutationObserver((mutationsList: MutationRecord[]) => {
    const mutations = mutationsList.filter(m => m.type === 'childList' && m.addedNodes.length);
    mutations.forEach((mutation) => {
      if (mutation.target instanceof HTMLSpanElement) return;

      mutation.addedNodes.forEach(node => {
        const textNodes = textNodesUnder(node);
        textNodes.forEach(callback);
      });
    });
  });
}