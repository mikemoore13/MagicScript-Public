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
      if (changeInfo.url.indexOf("https://appstoreconnect.apple.com/") !== 0) {
        return;
      }

      console.log('message from background')
      try {
        const maybePromise = chrome.tabs.sendMessage(tabId, {
          message: 'hello!',
          url: changeInfo.url
        });

        if (maybePromise && typeof maybePromise.then === "function" && typeof maybePromise.catch === "function") {
          maybePromise.catch(function() {
            // URL 变化早于 content script 注入时会触发此错误，属于可预期场景。
          });
        }
      } catch (error) {
        // 同上：静默忽略没有接收方的瞬时错误。
      }
    }
  }
);

// chrome.identity.getProfileUserInfo(function(userInfo) {
//   console.log(JSON.stringify(userInfo));
// });
