function getSaveElement() {
    const headingButtons = document.querySelector('[id="heading-buttons"]');
    if (!headingButtons) {
        return null;
    }

    const buttonList = Array.from(headingButtons.querySelectorAll("button"));
    const saveButton = buttonList.find((button) =>
        /save/i.test((button.innerText || button.textContent || "").trim())
    );

    return saveButton || buttonList[1] || buttonList[0] || headingButtons.children[1] || null;
}

function getMetadataMenuItems() {
    if (typeof getMenuItemsFromOpenMenu === "function") {
        return getMenuItemsFromOpenMenu();
    }

    const menu = document.querySelector('[class*="MenuList__Outer-sc-rmfrs7-0"]')
        || document.querySelector('[class*="MenuList__Outer"]');
    if (!menu) {
        return [];
    }

    return Array.from(menu.children || []);
}

function getMetadataMenuItemText(item) {
    if (typeof getMenuItemText === "function") {
        return getMenuItemText(item);
    }

    if (!item) {
        return "";
    }

    return (item.innerText || item.textContent || "").trim();
}

function ensureMetadataMenuOpen() {
    if (typeof ensureLanguageMenuOpen === "function") {
        return ensureLanguageMenuOpen();
    }

    if (typeof clickLanguageMenuButton === "function") {
        clickLanguageMenuButton();
    } else {
        const fallbackButton = document.querySelector('button[class*="Link-sc-1tc8rtf-0"][class*="Box-sc-18eybku-0"]');
        if (fallbackButton) {
            fallbackButton.click();
        }
    }

    return getMetadataMenuItems().length > 0;
}

function selectMetadataLanguage(language) {
    if (typeof selectLanguageMenuItemByText === "function") {
        return selectLanguageMenuItemByText(language);
    }

    if (!ensureMetadataMenuOpen()) {
        return false;
    }

    const menuItems = getMetadataMenuItems();
    for (const item of menuItems) {
        if (getMetadataMenuItemText(item) === language) {
            item.click();
            return true;
        }
    }
    return false;
}

function replaceButton() {
    console.log("replace button");
    const saveElement = getSaveElement();
    if (!saveElement) {
        console.log("[MagicScript][replaceButton] save button not found");
        return;
    }
    saveElement.removeEventListener("click", clickSubmit);
    saveElement.addEventListener("click", clickSubmit);
}

function clickSubmit(event) {
    console.log("Click submit");
    event.preventDefault();
    event.stopPropagation();
    chrome.storage.local.get("autoSave", function(result) {
        console.log("result");
        if (result.autoSave) {
            saveMetaData();
        }
        reproduceDefaultAction();
    });
}

function reproduceDefaultAction() {
    const saveElement = getSaveElement();
    if (!saveElement) {
        console.log("[MagicScript][reproduceDefaultAction] save button not found");
        return;
    }
    saveElement.removeEventListener("click", clickSubmit);
    saveElement.click();
    replaceButton();
}

function saveMetaData() {
    const copyContents = {};
    let menuItems = [];

    if (typeof getMenu === "function") {
        menuItems = getMenu(copyContents);
    } else if (ensureMetadataMenuOpen()) {
        menuItems = getMetadataMenuItems();
        for (const item of menuItems) {
            const language = getMetadataMenuItemText(item);
            if (language) {
                copyContents[language] = "";
            }
        }
    }

    if (!menuItems.length) {
        console.log("[MagicScript][saveMetaData] menuItems not found");
        return;
    }

    for (const language in copyContents) {
        copyContents[language] = {};
    }

    let version = "";
    //解析URL，并保存应用id，应用端
    const url = window.location.toString();
    const urlArray = url.split("/");
    const appId = urlArray[4] || "";
    const platform = urlArray[6] || "";

    //获取app名
    const appNameContainer = document.querySelector('[id="_m_sub_title"]');
    const appNameNode = appNameContainer ? appNameContainer.querySelector("span") : null;
    const appName = (appNameNode ? appNameNode.innerText : appNameContainer ? appNameContainer.innerText : "").trim();

    //遍历并且切换语言，将语言下的metadata内容保存到词典中
    for (const language in copyContents) {
        if (!selectMetadataLanguage(language)) {
            continue;
        }

        copyContents[language].whatsNew = copyWhatsnew("whatsNew");
        copyContents[language].promotionalText = copyWhatsnew("promotionalText");
        copyContents[language].description = copyWhatsnew("description");
        copyContents[language].versionString = copyInput("versionString");
        copyContents[language].keywords = copyInput("keywords");
        version = copyContents[language].versionString || version;
    }

    console.log("copyContents");
    console.log(copyContents);
    const date = new Date();
    console.log("date");
    console.log(date);
    const saveContents = {
        appName: appName,
        platform: platform,
        appId: appId,
        version: version,
        metadata: copyContents,
        date: date.toJSON()
    };
    console.log(saveContents);
    alert("Successfully saved the latest version of metadata!");

    chrome.storage.local.get("history", function(result) {
        const history = Array.isArray(result.history) ? result.history : [];
        history.unshift(saveContents);
        chrome.storage.local.set({ history: history }, function() {});
    });
}
