var SAVE_BUTTON_TEXT_RE = /\b(save|enregistrer|guardar|speichern|salva|salvar|opslaan|menteni|保存|儲存|저장|บันทึก)\b/i;
var CANCEL_BUTTON_TEXT_RE = /\b(cancel|annuler|abbrechen|cancelar|annulla|cancela|取消|취소)\b/i;
var replaceButtonRetryTimer = null;
var replaceButtonRetryCount = 0;
var MAX_REPLACE_BUTTON_RETRIES = 60;
var boundSaveButton = null;

function normalizeButtonText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
}

function isVisibleButton(button) {
    if (!button) {
        return false;
    }

    const rect = button.getBoundingClientRect();
    if (!rect || (rect.width <= 0 && rect.height <= 0)) {
        return false;
    }

    const style = window.getComputedStyle(button);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function isDisabledButton(button) {
    return Boolean(button && (button.disabled || button.getAttribute("aria-disabled") === "true"));
}

function getButtonMetadataText(button) {
    const attrList = [
        "id",
        "name",
        "type",
        "aria-label",
        "data-testid",
        "data-testid",
        "data-test-id",
        "class"
    ];

    const values = [];
    for (const attr of attrList) {
        const value = button.getAttribute(attr);
        if (value) {
            values.push(value);
        }
    }
    return normalizeButtonText(values.join(" ")).toLowerCase();
}

function scoreSaveButtonCandidate(button) {
    if (!button) {
        return -10000;
    }

    let score = 0;
    const text = normalizeButtonText(button.innerText || button.textContent || "");
    const metadataText = getButtonMetadataText(button);
    const inHeading = Boolean(button.closest('[id="heading-buttons"]'));

    if (!isVisibleButton(button)) {
        return -1000;
    }

    if (SAVE_BUTTON_TEXT_RE.test(text)) {
        score += 140;
    }

    if (CANCEL_BUTTON_TEXT_RE.test(text)) {
        score -= 200;
    }

    if (/(save|submit|enregistrer|guardar|speichern|salva|salvar|保存|儲存|저장)/i.test(metadataText)) {
        score += 90;
    }

    if (/(cancel|annuler|abbrechen|cancelar|annulla|cancela|取消|취소)/i.test(metadataText)) {
        score -= 120;
    }

    if (button.getAttribute("type") === "submit") {
        score += 70;
    }

    if (/(primary|cta|filled|brand|action)/i.test(metadataText)) {
        score += 20;
    }

    if (inHeading) {
        score += 30;
    }

    if (isDisabledButton(button)) {
        score -= 20;
    }

    if (!text) {
        score -= 10;
    }

    return score;
}

function getSaveElement(options = {}) {
    const includeDisabled = options.includeDisabled !== false;
    const candidates = [];
    const seen = new Set();
    const selectors = [
        '[id="heading-buttons"] button',
        'main button',
        'button[type="submit"]',
        'button[aria-label]',
        'button[data-testid]',
        'button[data-testid]',
        'button[data-test-id]',
        'button'
    ];

    for (const selector of selectors) {
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

    let bestButton = null;
    let bestScore = -10000;
    for (const button of candidates) {
        if (!includeDisabled && isDisabledButton(button)) {
            continue;
        }
        const score = scoreSaveButtonCandidate(button);
        if (score > bestScore) {
            bestScore = score;
            bestButton = button;
        }
    }

    if (!bestButton || bestScore < 60) {
        return null;
    }

    return bestButton;
}

function scheduleReplaceButtonRetry() {
    if (replaceButtonRetryTimer || replaceButtonRetryCount >= MAX_REPLACE_BUTTON_RETRIES) {
        return;
    }

    replaceButtonRetryTimer = setTimeout(() => {
        replaceButtonRetryTimer = null;
        replaceButtonRetryCount += 1;
        replaceButton();
    }, 500);
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
        scheduleReplaceButtonRetry();
        return;
    }

    replaceButtonRetryCount = 0;

    if (boundSaveButton && boundSaveButton !== saveElement) {
        boundSaveButton.removeEventListener("click", clickSubmit);
    }
    saveElement.removeEventListener("click", clickSubmit);
    saveElement.addEventListener("click", clickSubmit);
    boundSaveButton = saveElement;
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
    const saveElement = getSaveElement() || boundSaveButton;
    if (!saveElement) {
        console.log("[MagicScript][reproduceDefaultAction] save button not found");
        return;
    }
    saveElement.removeEventListener("click", clickSubmit);
    saveElement.click();
    setTimeout(() => {
        replaceButton();
    }, 400);
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
