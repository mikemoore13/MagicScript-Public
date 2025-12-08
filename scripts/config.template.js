// MagicScript 配置模板文件。
// 开源仓库中建议只保留本文件，不提交包含真实服务地址的 config.js。
// 使用方式：
// 1. 将本文件复制为 config.js：cp scripts/config.template.js scripts/config.js
// 2. 在 config.js 中填入你自己的服务地址（如翻译服务、埋点服务等）。
// 3. 在 .gitignore 中忽略 scripts/config.js，避免将私有配置提交到开源仓库。
//
// 注意：浏览器扩展运行在前端环境，真正发布给用户的扩展包里，这些地址仍然是可见的，
// 只能做到「不在开源仓库泄露」，无法对最终用户完全隐藏。

window.MagicScriptConfig = {
  // 翻译服务基础地址，例如：https://your-translate-service.example.com
  // 开源仓库中可以保留示例/占位值，实际使用时在本地 config.js 中改成真实地址。
  TRANSLATE_BASE_URL: "https://your-translate-service.example.com"

  // 如果未来希望把埋点服务地址也做成可配置，可以在这里增加：
  // EVENT_TRACK_BASE_URL: "https://your-event-track-service.example.com/api/event"
};

