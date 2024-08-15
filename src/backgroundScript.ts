/**
 * Show page actions icon only on pages with video
 */
const sites = ['www.netflix.com', 'kino.pub', 'www.youtube.com', 'www.primevideo.com'];
const conditions = sites.map(
  (hostEquals) =>
    new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostEquals } }),
);
const actions = [new chrome.declarativeContent.ShowAction()];

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{ conditions, actions }]);
  });
});

chrome.runtime.setUninstallURL('https://app.whirr.co/p/clzpavjjl01iior0hza2y7zk5');
