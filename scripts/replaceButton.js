function replaceButton(){
    console.log("replace button")
    const saveElement = document.querySelector('[id="heading-buttons"]').children[1]
    saveElement.removeEventListener("click", clickSubmit)
    saveElement.addEventListener("click", clickSubmit)
}
function clickSubmit(event){
    console.log("Click submit")
    event.preventDefault()
    event.stopPropagation()
    chrome.storage.local.get('autoSave', function(result){
        console.log("result")
        if (result.autoSave){
            saveMetaData()
        }
        reproduceDefaultAction()
    })
}

function reproduceDefaultAction(){
    const saveElement = document.querySelector('[id="heading-buttons"]').children[1]
    saveElement.removeEventListener("click", clickSubmit)
    saveElement.click()
    replaceButton()
}

function saveMetaData(){
    var copyContent = ""
    var copyContents = {}
    //点击语言menu
    document.querySelector('[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 eeVlrs"]').click()
    //获取menu的列表
    const ul = document.querySelector('[class="Box-sc-18eybku-0 MenuList__Outer-sc-rmfrs7-0 dhoypH"]')
    console.log(ul)
    //将menu下的所有语言存储到词典中
    for (let child of ul.children){
      console.log(child.querySelector('[class="Box-sc-18eybku-0 cMUEAH"]').firstChild)
      let language = child.querySelector('[class="Box-sc-18eybku-0 cMUEAH"]').firstChild.textContent
      console.log(language)
      copyContents[language] = {}
    }
    console.log(copyContents)
    let menuItems = document.querySelectorAll('[class="Box-sc-18eybku-0 cMUEAH"]')
    console.log(`menuItems ${menuItems}`)
    let version = ""
    //解析URL，并保存应用id，应用端
    let url = window.location.toString()
    let urlArray = url.split('/')
    let appId = urlArray[4]
    let platform = urlArray[6]
    //获取app名
    let appName = document.querySelector('[id="'+"_m_sub_title"+'"]').firstChild.querySelector("span").innerText
    //遍历并且切换语言，将语言下的metadata内容保存到词典中
    for (let language in copyContents){
      document.querySelector('[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 eeVlrs"]').click()
      for (item of menuItems) {
        console.log(item)
        if (item.firstChild.textContent == language){
         item.click()
         copyContents[language]["whatsNew"] = copyWhatsnew("whatsNew")
         copyContents[language]["promotionalText"] = copyWhatsnew("promotionalText")
         copyContents[language]["description"] = copyWhatsnew("description")
         copyContents[language]["versionString"] = copyInput("versionString")
         copyContents[language]["keywords"] = copyInput("keywords")
         version = copyInput("versionString")
        }    
      }
    }
    console.log('copyContents')
    console.log(copyContents)
    let date = new Date()
    console.log("date")
    console.log(date)
    let saveContents = {
        "appName": appName,
        "platform": platform,
        "appId": appId,
        "version": version,
        "metadata": copyContents,
        "date": date.toJSON()
    }
    console.log(saveContents)
    alert("Successfully saved the latest version of metadata!")
    chrome.storage.local.get('history', function(result){
        if (Object.keys(result).length != 0){
            result['history'].unshift(saveContents)
            chrome.storage.local.set(result, function(){
            })
        }else{
            let history = {history: [saveContents]}
            chrome.storage.local.set(history, function(){
            })
        }
    });
}
