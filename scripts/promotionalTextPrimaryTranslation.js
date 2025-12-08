
// 说明：将自定义输入的文案翻译成各语言后，填充 inflight 版本的 Promotional Text 字段
// 入口由 popup.js 在选择 “with translation” 时注入
// 注意：不声明全局变量，避免与其他脚本重复声明同名标识符。
chrome.storage.local.get('selectedPlatform', function(result) {
  const pageCheckResult = self.pageCheck(result.selectedPlatform, true);
  if (pageCheckResult.success){
    const ul = pageCheckResult.ul;
    // 延迟一段时间，等待 inflight 页完整加载
    setTimeout(() => {
      self.copyAndPastePrimary('promotionalText', ul, true);
    }, 3000);
  }
});  
