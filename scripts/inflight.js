//contents.js是兼听url变化，如果直接landing到inflight页面时，不会触发listener
console.log("inflight.js")
checkLoaded()
function checkLoaded(){
    setTimeout(() => {
      if (document.querySelector('[id="heading-buttons"]')){
        replaceButton()
      }else{
        checkLoaded()
      }
    }, 3500)
  }
