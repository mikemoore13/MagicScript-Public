

// 说明：将自定义输入的文案翻译成各语言后，填充 inflight 版本的 What's New 字段
// 入口由 popup.js 在选择 “with translation” 时注入
// 注意：这里不再使用 let 声明全局变量，避免在同一页面多次注入脚本时出现
// “Identifier 'selectedPlatform' has already been declared” 的语法错误。
chrome.storage.local.get('selectedPlatform', function(result) {
  console.log('[MagicScript][whatsNewPrimaryTranslation] selected platform:', result.selectedPlatform);
  const pageCheckResult = self.pageCheck(result.selectedPlatform, true);
  if (pageCheckResult.success){
    const ul = pageCheckResult.ul;
    // 延迟一段时间，等待 inflight 页完整加载
    setTimeout(() => {
      self.copyAndPastePrimary('whatsNew', ul, true);
    }, 3000);
  }
});
