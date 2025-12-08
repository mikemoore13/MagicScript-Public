// 说明：pageCheck 负责在 App Store Connect 的分发页面上定位指定平台下的版本列表，
// 并根据 directToInflight 参数决定是跳转到 inflight 还是 deliverable。
function pageCheck(end, directToInflight = false) {
  // App Store Connect 左侧平台列表容器（iOS / macOS / tvOS 等）
  const platforms = document.querySelector('[class="Box-sc-18eybku-0 bHeRUM"]');
  let ul;

  console.log("[MagicScript][pageCheck] target platform:", end);

  const url = window.location.toString();

  console.log("[MagicScript][pageCheck] current url:", url);
  // 如果不在 distribution 页面，则提醒用户先切到正确页面
  if (!platforms || url.indexOf("distribution") === -1) {
    window.alert(
      "Go the page in App Store Connect where you can edit your app's description first. \n\nThe URL will be like https://appstoreconnect.apple.com/apps/yourAppid/distribution/ios/version/inflight"
    );
    return { success: false, ul: ul };
  }

  let seletedPlatformExist = false;
  for (let platform of platforms.children) {
    console.log("[MagicScript][pageCheck] platform node:", platform);
    if (
      platform.firstChild &&
      platform.firstChild.firstChild &&
      platform.firstChild.firstChild.textContent.indexOf(end.toString()) > -1
    ) {
      // 说明：platform.children[1] 是当前平台下「版本列表」的容器，后续会在这里找 inflight / deliverable
      ul = platform.children[1];
      console.log("[MagicScript][pageCheck] matched platform ul:", ul);
      seletedPlatformExist = true;
      break;
    }
  }

  if (!seletedPlatformExist || !ul) {
    window.alert("The platform you selected is not found");
    return { success: false, ul: ul };
  }

  // 不存在待发布页面，则提醒需要创建新版本
  let hasInflight = false;
  let target = ul;
  // 未发布的 1.0 版本 DOM 结构与正常版本略不同，这里做一次兼容处理
  if (ul.children.length === 1) {
    if (ul.firstChild && ul.firstChild.firstChild && ul.firstChild.firstChild.tagName === "DIV") {
      target = ul.firstChild;
    }
  }

  for (let child of target.children) {
    if (
      child.firstChild &&
      child.firstChild.getAttribute("href") &&
      child.firstChild.getAttribute("href").indexOf("inflight") > -1
    ) {
      console.log("[MagicScript][pageCheck] has inflight version");
      hasInflight = true;
    }
  }

  if (!hasInflight) {
    console.log("[MagicScript][pageCheck] no inflight version found");
    window.alert("Create a new version first");
    return { success: false, ul: ul };
  }

  // 根据 directToInflight 决定是跳到 inflight 还是 deliverable
  if (directToInflight) {
    for (let child of target.children) {
      if (
        child.firstChild &&
        child.firstChild.getAttribute("href") &&
        child.firstChild.getAttribute("href").indexOf("inflight") > -1
      ) {
        console.log("[MagicScript][pageCheck] navigate to inflight");
        child.firstChild.click();
        return { success: true, ul: ul };
      }
    }
  } else {
    for (let child of target.children) {
      if (
        child.firstChild &&
        child.firstChild.getAttribute("href") &&
        child.firstChild.getAttribute("href").indexOf("deliverable") > -1
      ) {
        console.log("[MagicScript][pageCheck] navigate to deliverable");
        child.firstChild.click();
        return { success: true, ul: ul };
      }
    }
  }

  // 理论上不会走到这里，但为了安全起见仍然返回失败
  console.log("[MagicScript][pageCheck] no matched inflight/deliverable link");
  return { success: false, ul: ul };
}
  function getMenu(copyContents){
    // 为了便于调试 App Store Connect 语言菜单 DOM 变化，这里增加详细日志和空值检查
    // 这里显式限制为 button，避免页面上其他拥有同样 class 的元素被误选
    const languageMenuSelector = 'button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]'
    const menuListSelector = '[class="Box-sc-18eybku-0 MenuList__Outer-sc-rmfrs7-0 djfvjw fpVofh"]'
    const menuItemSelector = '[class="Box-sc-18eybku-0 cMUEAH"]'

    console.log("[MagicScript][getMenu] start getMenu")

    // 点击语言下拉按钮
    const languageMenuButton = document.querySelector(languageMenuSelector)
    if (!languageMenuButton){
      console.log("[MagicScript][getMenu] language menu button not found, selector:", languageMenuSelector)
      return []
    }
    languageMenuButton.click()
    console.log("[MagicScript][getMenu] language menu button clicked")

    // 获取语言列表容器
    const ul = document.querySelector(menuListSelector)
    if (!ul){
      console.log("[MagicScript][getMenu] language menu list not found, selector:", menuListSelector)
      return []
    }
    console.log("[MagicScript][getMenu] language list element:", ul)
    console.log("[MagicScript][getMenu] language list children count:", ul.children ? ul.children.length : 0)

    // 将 menu 下的所有语言存储到词典中，并打详细日志
    for (let child of ul.children){
      const item = child.querySelector(menuItemSelector)
      if (!item || !item.firstChild){
        console.log("[MagicScript][getMenu] skip invalid menu item:", child)
        continue
      }
      console.log("[MagicScript][getMenu] raw menu item node:", item.firstChild)
      let language = item.firstChild.textContent
      console.log("[MagicScript][getMenu] detected language:", language)
      copyContents[language] = ""
    }

    const menuItems = document.querySelectorAll(menuItemSelector)
    console.log("[MagicScript][getMenu] final menuItems length:", menuItems.length)
    return menuItems
  }
  function copyAndPaste(position, ul){
    var copyContents = {}
    let menuItems = getMenu(copyContents)
    //遍历并且切换语言，将语言下的whatnew内容保存到词典中
    for (let language in copyContents){
      // 这里同样限制为 button，避免误点非按钮元素
      document.querySelector('button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]').click()
      for (item of menuItems) {
        console.log(item)
        if (item.firstChild.textContent == language){
         item.click()
         copyContents[language] = copyWhatsnew(position)
        }    
      }
    }
    //切换到准备发布的tab(准备发布和已发布的class id 都是Box-sc-18eybku-0 eEFQij，逻辑是切换到第一个匹配元素，即准备发布)
    ul.firstChild.firstChild.click()
    //使用迭代的方式实现所有语言的粘贴
    setTimeout(() => {
      //点击语言menu
      document.querySelector('button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]').click()
      let menuItems = document.querySelectorAll('[class="Box-sc-18eybku-0 cMUEAH"]')
      //使用迭代的方式实现所有语言的粘贴
      pasteWhatsnew(0, menuItems, position, copyContents)
    }, 3000);
  }
  async function copyAndPastePrimary(position, ul, isTranslation = false){
    var copyContents = {}
    let menuItems = getMenu(copyContents)
    //复制主语言
    // 主语言复制时也限定点击 button，防止 DOM 结构变更导致选错元素
    document.querySelector('button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]').click()
    menuItems[0].click()
    console.log("menuitem", menuItems[0])
    let primaryContent = copyWhatsnew(position)
    let translateResult
    if (isTranslation){
      let languageList = []
      for (let language in copyContents){
        languageList.push(language)
      }
      let textContent = await fetchTextContent()
      console.log("textContent", textContent)
      translateResult = await translate(textContent, languageList)
    }
    //遍历并且切换语言，将primary语言下的whatnew内容复制并保存
    console.log("copyContents", copyContents)
    console.log("menuItems", menuItems)
    for (let language in copyContents){
      // 每次切换语言前，统一通过 button 选择语言菜单
      document.querySelector('button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]').click()
      for (item of menuItems) {
        console.log(item)
        if (item.firstChild.textContent == language){
         item.click()
         console.log("translate Result", language)
         if (isTranslation){
          copyContents[language] = translateResult[language]
         }else{
          copyContents[language] = primaryContent
         }
        }    
      }
    }
    //切换到准备发布的tab
    ul.firstChild.firstChild.click()
    //使用迭代的方式实现所有语言的粘贴
    setTimeout(() => {
      //点击语言menu
      document.querySelector('button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]').click()
      let menuItems = document.querySelectorAll('[class="Box-sc-18eybku-0 cMUEAH"]')
      //使用迭代的方式实现所有语言的粘贴
      if (menuItems.length > 1){
        pasteWhatsnew(0, menuItems, position, copyContents)
      }
    }, 3000);
  }
  function copyWhatsnew(position) {
    if (document.querySelector('[name="'+position+'"]').querySelector("div") != null){
      const element = document.querySelector('[name="'+position+'"]');
      // 获取所有文本内容，包括换行
      return Array.from(element.childNodes)
        .map(node => {
          if (node.innerHTML === '<br>') return '';
          // 否则返回文本内容
          return node.innerText;
        })
        .join('\n')
        .trim();
    }else{
      return ""
    }
  }
  function copyInput(position) {
    console.log("print1")
    console.log(document.querySelector('[name="'+position+'"]'))
    console.log("print 2")
    console.log(document.querySelector('[name="'+position+'"]').value)
    return document.querySelector('[name="'+position+'"]').value
  }
  
  function pasteWhatsnew(index, items, position, copyContents){
    console.log(`items ${items}`)
    console.log(`items[index] ${items[index]}`)
    let menuItems = document.querySelectorAll('[class="Box-sc-18eybku-0 cMUEAH"]')
    console.log(`menuItems ${menuItems}`)
    //切换语言，不能直接点击items[index]，必须点击新获取的menuItems中的元素，所以需要循环
    for (ite of menuItems) {
      console.log("ite.innerText vs items[index].innerText")
      console.log(ite.innerText)
      console.log(items[index].innerText)
      if (ite.innerText == items[index].innerText){
        console.log("try to click2")
        console.log(ite)
        console.log(items[index])
        ite.click()
      }    
    }
    //粘贴文本
    console.log("position")
    console.log(position)
    const editor = document.querySelector('[name="'+position+'"]');
    editor.oninput = (e) => console.log('Input');
    setTimeout(() => {
      clearEditor(editor)
      console.log(`match ${items[index].innerText}`)
      let language2 = items[index].firstChild.textContent
      document.execCommand('insertText', false, copyContents[language2]);
    }, 1000);
    //点击保存
    setTimeout(() => {
      //save
      document.querySelector('[id="heading-buttons"]').firstChild.click()
    }, 2000);
    //打开菜单，迭代函数
    setTimeout(() => {
      if (index < items.length - 1){
        //open menu
        document.querySelector('button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]').click()
        pasteWhatsnew(index+1, items, position, copyContents)
      }
    }, 5000)
  }

function clearEditor(editor){
  editor.focus();
  // 选中整个编辑器的内容
    const range = document.createRange();
    range.selectNodeContents(editor);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}



function getTextContent() {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get('textContent', function(result) {
          if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
          } else {
              resolve(result.textContent);
          }
      });
  });
}

async function fetchTextContent() {
  try {
      return await getTextContent();
  } catch (error) {
      console.error('Error retrieving value:', error);
      return null
  }
}
