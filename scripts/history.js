// 说明：history.js 用于在 history.html 中渲染 metadata 历史记录。
// 这里增加必要的空值判断和更清晰的日志，避免开源后因为本地没有数据或 DOM 缺失而报错。

document.body.onload = addElement;

function addElement() {
  console.log("[MagicScript][history] addElement");
  chrome.storage.local.get("history", function (result) {
    console.log("[MagicScript][history] storage history raw:", result);

    const vstack = document.querySelector("#vstack");
    if (!vstack) {
      console.log("[MagicScript][history] #vstack element not found");
      return;
    }

    const historyList = result && Array.isArray(result.history) ? result.history : [];
    if (historyList.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.innerText = "No metadata history found.";
      vstack.appendChild(emptyDiv);
      return;
    }

    for (const re of historyList) {
      const newDiv = document.createElement("div");
      newDiv.innerHTML = `<p>App Name: ${re.appName}</p>`;
      newDiv.innerHTML += `<p>Platform: ${re.platform}</p>`;
      newDiv.innerHTML += `<p>Version: ${re.version}</p>`;

      const d = new Date(re.date);
      newDiv.innerHTML += `<p>Submit date: ${d.toDateString()}</p>`;
      newDiv.innerHTML += `<p>Metadata:</p>`;

      if (re.metadata && typeof re.metadata === "object") {
        for (const [key, value] of Object.entries(re.metadata)) {
          newDiv.innerHTML += `<pre>  Language: ${key}</pre>`;
          newDiv.innerHTML += `<pre>    Promotianal text: ${value.promotionalText}</pre>`;
          newDiv.innerHTML += `<pre>    Description: ${value.description}</pre>`;
          newDiv.innerHTML += `<pre>    What's new: ${value.whatsNew}</pre>`;
          newDiv.innerHTML += `<pre>    Keywords: ${value.keywords}</pre>`;
          newDiv.innerHTML += `<pre>    </pre>`;
        }
      }

      vstack.appendChild(newDiv);
    }
  });
}
