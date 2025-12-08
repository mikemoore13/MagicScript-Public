// 说明：下面是浏览器端使用的翻译入口函数。
// 之前文件中保留了一些 Node + OpenAI 的实验性代码与测试秘钥，为了开源安全与可读性，这里已经全部移除，
// 仅保留对远端翻译服务的 HTTP 调用逻辑。

// 从全局配置中获取翻译服务地址；如果没有配置，则可以在开源仓库中保留占位符，
// 实际使用时在本地 config.js（不提交到 git）中填写真实地址。
function getTranslateBaseURL() {
    // 优先从 window.MagicScriptConfig 读取（由 scripts/config.js 注入）
    if (window.MagicScriptConfig && window.MagicScriptConfig.TRANSLATE_BASE_URL) {
        return window.MagicScriptConfig.TRANSLATE_BASE_URL;
    }
    // 默认返回一个占位地址；开源仓库中可以保持为示例值
    // 实际使用时建议只在本地 config.js 中配置真实地址，而不是修改这里。
    return "https://your-translate-service.example.com";
}

async function translate(origin, languageList) {
    let localURL = "http://localhost:8080"
    const cloudURL = getTranslateBaseURL();
    const url = `${cloudURL}/search`;
    
    // 为了让 LLM 返回更稳定、更符合预期的 JSON，这里将 prompt 写得更「严格」：
    //  1. 明确给出原文和目标语言列表
    //  2. 要求仅返回一个 JSON 对象（没有 markdown、解释性文字）
    //  3. 要求 key 必须与传入的 languageList 完全一致（包括大小写、空格、括号等）
    //  4. 给出一个示例 JSON 结构作为格式参考
    let languageListString = ""
    for (let language of languageList){
        languageListString += language + ", "
    }

    const prompt =
`你是一个严格遵守格式要求的翻译助手。

待翻译原文：
${origin}

目标语言列表（每一项是一个完整的 key 字符串）：
${languageListString}

请将上面的原文翻译成目标语言列表中的所有语言，并严格按照下面的要求返回结果：
1. 仅返回一个 JSON 对象，不能包含 markdown、代码块标记（例如 \`\`\`json）、解释性文字或任何额外内容。
2. JSON 的每个 key 必须与目标语言列表中的字符串完全一致（包括大小写、空格、括号等），不能新增、删除或修改任何 key。
3. JSON 的每个 value 为对应语言的完整译文字符串。
4. 如果某个语言无法合理翻译，也必须保留该 key，并将 value 设置为原文。

示例（注意：下面示例中的 key 只是格式示例，真实回答中必须使用上方目标语言列表中的字符串）：
{"English (U.S.)": "translated text", "Japanese": "翻译后的文本"}`;

    let requestBody = JSON.stringify([{ role: "system", content: prompt }]);
    console.log("translate: requestBody", requestBody)

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        console.log("translate: response", response)

        const result = await response.json();
        console.log("translate: result", result)

        return result;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error;
    }
}
