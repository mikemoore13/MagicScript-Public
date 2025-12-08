// 说明：埋点事件上报模块。
// 为了避免在开源仓库中暴露真实埋点服务地址，这里从 window.MagicScriptConfig 中读取配置，
// 真实地址只需要在本地 scripts/config.js 中配置（该文件已被 .gitignore 忽略）。
function getEventTrackURL() {
    if (window.MagicScriptConfig && window.MagicScriptConfig.EVENT_TRACK_BASE_URL) {
        return window.MagicScriptConfig.EVENT_TRACK_BASE_URL;
    }
    // 开源仓库中的占位地址，实际使用时应在 config.js 中配置真实地址。
    return "https://your-event-track-service.example.com/api/event";
}

window.EventTracker = {
    getServerURL() {
        return getEventTrackURL();
    },

    getDeviceID() {
        const key = "DeviceID";
        let id = localStorage.getItem(key);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(key, id);
        }
        return id;
    },

    getAppVersion() {
        // Set your extension version manually or get from manifest if in content script
        return chrome.runtime?.getManifest?.().version || "Unknown";
    },

    getAppID() {
        return "MagicScript"
    },

    getUserLocation() {
        return navigator.language.split('-')[1] || "Unknown";
    },

    getUserLanguage() {
        return navigator.language.split('-')[0] || "Unknown";
    },


    trackEvent(key, extra = {}) {
        console.log("Track event:", key);
        const event = {
            key,
            deviceID: this.getDeviceID(),
            timestamp: Date.now(),
            appVersion: this.getAppVersion(),
            appID: this.getAppID(),
            userLocation: this.getUserLocation(),
            userLanguage: this.getUserLanguage(),
            extra
        };
        this.uploadEvent(event);
    },

    uploadEvent(event) {
        fetch(this.getServerURL(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            console.log("Event uploaded successfully");
        })
        .catch(error => {
            console.error("Failed to upload event:", error);
        });
    }
};

window.EventKey = {
    subscripionButtonClick: "subscription_button_click",
    subscripionViewShow: "subscripion_view_show",
    subscripionViewPriceShow: "subscripion_view_price_show",
    subscripionSuccess: "subscripion_success",
    subscripionFail: "subscripion_fail",
    appUse: "app_use",
    subscriptionViewPriceFail: "subscripion_view_price_fail"
};
window.EventTracker.trackEvent(EventKey.appUse)
