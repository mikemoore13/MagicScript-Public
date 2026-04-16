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
// shareFunctions.js can be injected multiple times (content scripts + popup executeScript),
// so use `var` here to avoid top-level redeclaration errors on reinjection.
var LANGUAGE_MENU_BUTTON_SELECTORS = [
  'button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 jijsjF iKZzlZ"]',
  'button[class="Box-sc-18eybku-0 Link-sc-1tc8rtf-0 eeVlrs"]',
  'button[class*="Link-sc-1tc8rtf-0"][class*="Box-sc-18eybku-0"]',
  'button[aria-haspopup="menu"]'
];

var LANGUAGE_MENU_LIST_SELECTORS = [
  '[class="Box-sc-18eybku-0 MenuList__Outer-sc-rmfrs7-0 djfvjw fpVofh"]',
  '[class="Box-sc-18eybku-0 MenuList__Outer-sc-rmfrs7-0 dhoypH"]',
  '[class*="MenuList__Outer-sc-rmfrs7-0"]',
  '[class*="MenuList__Outer"]',
  '[role="menu"]'
];

var LANGUAGE_MENU_ITEM_SELECTORS = [
  '[class="Box-sc-18eybku-0 cMUEAH"]',
  '[class*="cMUEAH"]',
  '[class*="sc-EgOXT"]',
  '[role="menuitem"]'
];

function queryFirstBySelectors(selectors, root = document) {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
}

function matchesAnySelector(element, selectors) {
  if (!element || typeof element.matches !== "function") {
    return false;
  }

  for (const selector of selectors) {
    if (element.matches(selector)) {
      return true;
    }
  }
  return false;
}

function getLanguageMenuButton() {
  const candidates = [];
  const seen = new Set();

  for (const selector of LANGUAGE_MENU_BUTTON_SELECTORS) {
    for (const button of document.querySelectorAll(selector)) {
      if (!seen.has(button)) {
        seen.add(button);
        candidates.push(button);
      }
    }
  }

  if (!candidates.length) {
    return null;
  }

  const preferredButton = candidates.find((button) => {
    const label = (button.innerText || button.textContent || "").trim();
    return label && label.indexOf("(") > -1 && label.indexOf(")") > -1;
  });

  return preferredButton || candidates[0];
}

function clickLanguageMenuButton() {
  const languageMenuButton = getLanguageMenuButton();
  if (!languageMenuButton) {
    console.log("[MagicScript][languageMenu] language menu button not found");
    return false;
  }
  languageMenuButton.click();
  return true;
}

function getLanguageMenuList() {
  return queryFirstBySelectors(LANGUAGE_MENU_LIST_SELECTORS);
}

function getMenuItemText(item) {
  if (!item) {
    return "";
  }

  const rawText = item.innerText || item.textContent || "";
  if (!rawText) {
    return "";
  }

  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)[0] || "";
}

function getMenuItemNode(child) {
  if (!child) {
    return null;
  }

  if (matchesAnySelector(child, LANGUAGE_MENU_ITEM_SELECTORS)) {
    return child;
  }

  const nestedItem = queryFirstBySelectors(LANGUAGE_MENU_ITEM_SELECTORS, child);
  return nestedItem || child;
}

function getMenuItemsFromOpenMenu() {
  const ul = getLanguageMenuList();
  if (!ul) {
    return [];
  }

  const menuItems = [];
  const languageSet = new Set();

  for (const child of ul.children) {
    const itemNode = getMenuItemNode(child);
    const language = getMenuItemText(itemNode);
    if (!language || languageSet.has(language)) {
      continue;
    }
    menuItems.push(itemNode);
    languageSet.add(language);
  }

  if (menuItems.length) {
    return menuItems;
  }

  for (const itemNode of ul.querySelectorAll('[role="menuitem"]')) {
    const language = getMenuItemText(itemNode);
    if (!language || languageSet.has(language)) {
      continue;
    }
    menuItems.push(itemNode);
    languageSet.add(language);
  }
  return menuItems;
}

function ensureLanguageMenuOpen() {
  if (getLanguageMenuList()) {
    return true;
  }

  if (!clickLanguageMenuButton()) {
    return false;
  }

  return Boolean(getLanguageMenuList());
}

function selectLanguageMenuItemByText(language) {
  if (!language) {
    return false;
  }

  if (!ensureLanguageMenuOpen()) {
    console.log("[MagicScript][languageMenu] menu list not found when selecting:", language);
    return false;
  }

  const menuItems = getMenuItemsFromOpenMenu();
  for (const item of menuItems) {
    if (getMenuItemText(item) === language) {
      item.click();
      return true;
    }
  }

  console.log("[MagicScript][languageMenu] language item not found:", language);
  return false;
}

function clickHeadingSaveButton() {
  const headingButtons = document.querySelector('[id="heading-buttons"]');
  if (!headingButtons) {
    console.log("[MagicScript][save] #heading-buttons not found");
    return false;
  }

  const buttonCandidates = Array.from(headingButtons.querySelectorAll("button"));
  const saveButton = buttonCandidates.find((button) =>
    /save/i.test((button.innerText || button.textContent || "").trim())
  );

  const targetButton = saveButton || buttonCandidates[0] || headingButtons.firstElementChild;
  if (!targetButton) {
    console.log("[MagicScript][save] save button not found in heading");
    return false;
  }

  targetButton.click();
  return true;
}

function getMenu(copyContents) {
  console.log("[MagicScript][getMenu] start getMenu");

  if (!ensureLanguageMenuOpen()) {
    console.log("[MagicScript][getMenu] failed to open language menu");
    return [];
  }

  const ul = getLanguageMenuList();
  if (!ul) {
    console.log("[MagicScript][getMenu] language menu list not found");
    return [];
  }

  console.log("[MagicScript][getMenu] language list element:", ul);
  console.log("[MagicScript][getMenu] language list children count:", ul.children ? ul.children.length : 0);

  const menuItems = getMenuItemsFromOpenMenu();
  for (const item of menuItems) {
    const language = getMenuItemText(item);
    if (!language) {
      console.log("[MagicScript][getMenu] skip invalid menu item:", item);
      continue;
    }
    copyContents[language] = "";
  }

  console.log("[MagicScript][getMenu] final menuItems length:", menuItems.length);
  return menuItems;
}
function copyAndPaste(position, ul) {
  const copyContents = {};
  const menuItems = getMenu(copyContents);
  if (!menuItems.length) {
    console.log("[MagicScript][copyAndPaste] no language menu items found");
    return;
  }

  //遍历并且切换语言，将语言下的whatnew内容保存到词典中
  for (const language in copyContents) {
    if (!selectLanguageMenuItemByText(language)) {
      continue;
    }
    copyContents[language] = copyWhatsnew(position);
  }

  //切换到准备发布的tab(准备发布和已发布的class id 都是Box-sc-18eybku-0 eEFQij，逻辑是切换到第一个匹配元素，即准备发布)
  if (ul && ul.firstChild && ul.firstChild.firstChild) {
    ul.firstChild.firstChild.click();
  }

  //使用迭代的方式实现所有语言的粘贴
  setTimeout(() => {
    pasteWhatsnew(0, menuItems, position, copyContents);
  }, 3000);
}
async function copyAndPastePrimary(position, ul, isTranslation = false) {
  const copyContents = {};
  const menuItems = getMenu(copyContents);
  if (!menuItems.length) {
    console.log("[MagicScript][copyAndPastePrimary] no language menu items found");
    return;
  }

  const primaryLanguage = getMenuItemText(menuItems[0]);
  if (!selectLanguageMenuItemByText(primaryLanguage)) {
    console.log("[MagicScript][copyAndPastePrimary] failed to select primary language");
    return;
  }

  const primaryContent = copyWhatsnew(position);
  let translateResult;
  if (isTranslation) {
    const languageList = [];
    for (const language in copyContents) {
      languageList.push(language);
    }
    const textContent = await fetchTextContent();
    console.log("textContent", textContent);
    translateResult = await translate(textContent, languageList);
  }

  //遍历并且切换语言，将primary语言下的whatnew内容复制并保存
  console.log("copyContents", copyContents);
  console.log("menuItems", menuItems);
  for (const language in copyContents) {
    if (!selectLanguageMenuItemByText(language)) {
      continue;
    }

    console.log("translate Result", language);
    if (isTranslation) {
      copyContents[language] = (translateResult && translateResult[language]) || primaryContent;
    } else {
      copyContents[language] = primaryContent;
    }
  }

  //切换到准备发布的tab
  if (ul && ul.firstChild && ul.firstChild.firstChild) {
    ul.firstChild.firstChild.click();
  }

  //使用迭代的方式实现所有语言的粘贴
  setTimeout(() => {
    if (menuItems.length > 0) {
      pasteWhatsnew(0, menuItems, position, copyContents);
    }
  }, 3000);
}
function copyWhatsnew(position) {
  const element = document.querySelector('[name="' + position + '"]');
  if (!element) {
    console.log("[MagicScript][copyWhatsnew] element not found:", position);
    return "";
  }

  if (element.querySelector("div") != null) {
    // 获取所有文本内容，包括换行
    return Array.from(element.childNodes)
      .map((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.innerHTML === "<br>") {
          return "";
        }
        return node.innerText || node.textContent || "";
      })
      .join("\n")
      .trim();
  }

  return element.value || "";
}

function copyInput(position) {
  const inputElement = document.querySelector('[name="' + position + '"]');
  console.log("print1");
  console.log(inputElement);
  if (!inputElement) {
    return "";
  }

  console.log("print 2");
  console.log(inputElement.value);
  return inputElement.value || "";
}
  
function pasteWhatsnew(index, items, position, copyContents) {
  if (!items || !items.length || index >= items.length) {
    console.log("[MagicScript][pasteWhatsnew] invalid items or index", index);
    return;
  }

  const targetLanguage = getMenuItemText(items[index]);
  if (!targetLanguage) {
    console.log("[MagicScript][pasteWhatsnew] invalid language at index:", index);
    return;
  }

  if (!selectLanguageMenuItemByText(targetLanguage)) {
    console.log("[MagicScript][pasteWhatsnew] failed to select language:", targetLanguage);
    return;
  }

  //粘贴文本
  const editor = document.querySelector('[name="' + position + '"]');
  if (!editor) {
    console.log("[MagicScript][pasteWhatsnew] editor not found:", position);
    return;
  }

  editor.oninput = () => console.log("Input");
  setTimeout(() => {
    clearEditor(editor);
    console.log("[MagicScript][pasteWhatsnew] match", targetLanguage);
    document.execCommand("insertText", false, copyContents[targetLanguage] || "");
  }, 1000);

  //点击保存
  setTimeout(() => {
    clickHeadingSaveButton();
  }, 2000);

  //迭代函数
  setTimeout(() => {
    if (index < items.length - 1) {
      pasteWhatsnew(index + 1, items, position, copyContents);
    }
  }, 5000);
}

function clearEditor(editor){
  if (!editor) {
    return;
  }
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
