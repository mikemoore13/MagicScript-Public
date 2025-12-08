
// 说明：将主语言的 Promotional Text 复制到 inflight 版本的所有语言（不做翻译）
// 入口由 popup.js 动态注入执行
// 注意：不声明全局变量，避免与其他脚本重复声明同名标识符。
chrome.storage.local.get('selectedPlatform', function(result) {
  const pageCheckResult = self.pageCheck(result.selectedPlatform, true);
  if (pageCheckResult.success){
    const ul = pageCheckResult.ul;
    // 延迟一段时间，等待 inflight 页完整加载
    setTimeout(() => {
      self.copyAndPastePrimary('promotionalText', ul);
    }, 3000);
  }
});
  
