// 为 execute 按钮添加事件监听器
document.getElementById("execute").addEventListener("click", executeScript);
// document.getElementById("history").addEventListener("click", openHistoryTab);
// document.getElementById("saveMetaData").addEventListener("click", saveDataClick);

// document.body.onload = readAutoSaveState;


const copyOptionRadios = document.querySelectorAll('input[name="copyOption"]');
        
// 获取 Text Group 容器
const textGroup = document.getElementById('textGroup');

// 为 copyOption 单选按钮添加 change 事件监听
copyOptionRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        // 检查是否选择了 "copy_primary_translation"
        if (document.querySelector('input[name="copyOption"]:checked').value === 'copy_primary_translation') {
            textGroup.style.display = 'block'; // 显示 Text group
        } else {
            textGroup.style.display = 'none'; // 隐藏 Text group
        }
    });
});

// 显示执行提示框：这里改名为 showExecutionNotification，避免覆盖全局 alert，并修正注释与实现不一致的问题
function showExecutionNotification(){
    console.log("[MagicScript][popup] showExecutionNotification")
    const notification = document.getElementById('notification');
    if (!notification) {
        // 说明：理论上 popup.html 一定有 notification 元素，这里加判断是为了开源后防御性更好
        console.log("[MagicScript][popup] notification element not found");
        return;
    }
    notification.style.display = 'block'; // 显示提示消息
    // 实际展示时间是 10 秒，这里注释同步为 10 秒，避免误解
    setTimeout(function() {
        notification.style.display = 'none'; // 隐藏提示消息
    }, 10000);
}

// 获取当前选中的类型（whatsNew / promotionalText / both）
function getSelectedType() {
    return document.querySelector('input[name="type"]:checked').value;
}

function getSelectedPlatform() {
    return document.querySelector('input[name="platformType"]:checked').value;
}

// 获取当前选中的操作（copy_latest、copy_primary 或 copy_primary_translation）
function getSelectedOperation() {
    return document.querySelector('input[name="copyOption"]:checked').value;
}

function resolveTargetTypes(selectedType) {
    if (selectedType === "both") {
        return ["whatsNew", "promotionalText"];
    }
    return [selectedType];
}

function appendOperationScripts(scriptFiles, selectedOperation, selectedType) {
    const targetTypes = resolveTargetTypes(selectedType);
    const uniqueFiles = new Set(scriptFiles);

    if (selectedOperation === "copy_latest") {
        uniqueFiles.add("scripts/config.js");
        uniqueFiles.add("scripts/eventTracker.js");
        for (const type of targetTypes) {
            uniqueFiles.add(`scripts/${type}.js`);
        }
    } else if (selectedOperation === "copy_primary") {
        uniqueFiles.add("scripts/config.js");
        uniqueFiles.add("scripts/eventTracker.js");
        for (const type of targetTypes) {
            uniqueFiles.add(`scripts/${type}Primary.js`);
        }
    } else if (selectedOperation === "copy_primary_translation") {
        uniqueFiles.add("scripts/config.js");
        uniqueFiles.add("scripts/eventTracker.js");
        uniqueFiles.add("scripts/translate.js");
        for (const type of targetTypes) {
            uniqueFiles.add(`scripts/${type}PrimaryTranslation.js`);
        }
    }

    return Array.from(uniqueFiles);
}

// 处理 execute 按钮点击，根据选中的类型和操作执行对应的功能
async function executeScript() {
    // 说明：展示执行中的提示，引导用户等待页面自动修改
    showExecutionNotification();
    let currTab = await getTabId();
    let selectedType = getSelectedType(); // 获取选中的类型
    let selectedOperation = getSelectedOperation(); // 获取选中的操作
    let selectedPlatform = getSelectedPlatform(); // 获取选中的平台
    let scriptFiles = ["scripts/shareFunctions.js"];


    console.log("selectedPlatform", selectedPlatform)
    // 设置全局变量
    chrome.storage.local.set({ 'selectedPlatform': selectedPlatform }, function() {
        console.log('Variable stored');
    });

    // 根据选中的操作和类型决定加载哪些脚本
    switch (selectedOperation) {
        case "copy_latest":
            scriptFiles = appendOperationScripts(scriptFiles, selectedOperation, selectedType);
            break;
        case "copy_primary":
            scriptFiles = appendOperationScripts(scriptFiles, selectedOperation, selectedType);
            break;
        case "copy_primary_translation":
            scriptFiles = appendOperationScripts(scriptFiles, selectedOperation, selectedType);
            const textContent = document.getElementById('inputText').value;
            chrome.storage.local.set({ 'textContent': textContent }, function() {
                chrome.scripting.executeScript({
                    target: { tabId: currTab.id },
                    files: scriptFiles
                });
            });
            return;
        default:
            console.log("No operation selected");
            return;
    }

    // 执行 Chrome 脚本
    chrome.scripting.executeScript({
        target: { tabId: currTab.id },
        files: scriptFiles
    });
}

// 获取当前活动标签页
async function getTabId() {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
}

// 打开历史记录页面
// function openHistoryTab() {
//     chrome.tabs.create({ url: "history.html" });
// }

// // 读取 `autoSave` 状态
// function readAutoSaveState() {
//     chrome.storage.local.get('autoSave', function (result) {
//         document.getElementById("saveMetaData").checked = result.autoSave || false;
//     });
// }

// 处理 `autoSave` 选项变化
// function saveDataClick() {
//     let result = { 'autoSave': document.getElementById("saveMetaData").checked };
//     chrome.storage.local.set(result);
// }
