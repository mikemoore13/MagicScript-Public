// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//       target: {tabId: tab.id},
//       files: ["scripts/whatsNew.js"]
//     });
//   });
chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      console.log('message from background')
      chrome.tabs.sendMessage( tabId, {
        message: 'hello!',
        url: changeInfo.url
      }, function() {
        if (chrome.runtime.lastError) {
          // URL 变化早于 content script 注入时会触发此错误，属于可预期场景。
          return;
        }
      })
    }
  }
);

// chrome.identity.getProfileUserInfo(function(userInfo) {
//   console.log(JSON.stringify(userInfo));
// });
