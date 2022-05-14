// Show page actions icon only on Netflix page
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: ['www.netflix.com', 'kino.pub', 'www.youtube.com']
          .map(hostEquals => new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostEquals } })),
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});