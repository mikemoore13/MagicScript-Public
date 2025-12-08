

if (true){
  let selectedPlatform = chrome.storage.local.get('selectedPlatform', function(result) {
    console.log('Retrieved value:', result.selectedPlatform);
    var pageCheck = self.pageCheck(result.selectedPlatform)
    if (pageCheck.success){
      var ul = pageCheck.ul
      setTimeout(() => {
        self.copyAndPaste('promotionalText', ul)
      }, 3000);
    }
  });  
}


