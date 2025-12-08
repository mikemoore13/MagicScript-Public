console.log("content.js")
chrome.storage.local.get('history', function(result){
  console.log(result);
});


// console.log(document.querySelector('[id="heading-buttons"]'))
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // listen for messages sent from background.js
      if (request.message === 'hello!') {
        console.log(request.url) // new url is now in content scripts!
        let re = /inflight/;
        if(re.test(request.url)){
          replaceButton()
        }
      }
  });



