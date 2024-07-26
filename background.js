function showLoading() {
  browser.tabs.executeScript({
    code: `
      (function() {
        const loadingOverlay = document.createElement("div");
        loadingOverlay.style.position = "fixed";
        loadingOverlay.style.top = "50%";
        loadingOverlay.style.left = "50%";
        loadingOverlay.style.transform = "translate(-50%, -50%)";
        loadingOverlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
        loadingOverlay.style.border = "1px solid #ccc";
        loadingOverlay.style.padding = "20px";
        loadingOverlay.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        loadingOverlay.style.zIndex = "9999";

        const loadingText = document.createElement("p");
        loadingText.textContent = "translating...";
        loadingOverlay.appendChild(loadingText);

        document.body.appendChild(loadingOverlay);
      })();
    `
  });
}

function hideLoading() {
  browser.tabs.executeScript({
    code: `
      (function() {
        const loadingOverlay = document.querySelector("div[style*='position: fixed; top: 50%; left: 50%;']");
        if (loadingOverlay) {
          loadingOverlay.remove();
        }
      })();
    `
  });
}

function escapeStringForJSON(s) {
    var newstr = "";
    for (var i=0; i<s.length; i++) {
        c = s.charAt(i);
        switch (c) {
            case '\"':
                newstr+="\\\"";
                break;
            case '\\':
                newstr+="\\\\";
                break;
            case '/':
                newstr+="\\/";
                break;
            case '\b':
                newstr+="\\b";
                break;
            case '\f':
                newstr+="\\f";
                break;
            case '\n':
                newstr+="\\n";
                break;
            case '\r':
                newstr+="\\r";
                break;
            case '\t':
                newstr+="\\t";
                break;
            default:
                newstr+=c;
        }
   }
   return newstr;
}

async function sendTranslationRequest(text) {
  text = escapeStringForJSON(text);

  // 异步获取用户配置的prompt模板
  const storedData = await browser.storage.local.get('promptTemplate');
  const promptTemplate = storedData.promptTemplate || `{
    "model": "llama3.1:8b-instruct-q4_K_M",
    "prompt": "Translate to Traditional Chinese (result only): {text}",
    "stream": false
  }`;

  // 使用获取到的模板替换文本
  const prompt = promptTemplate.replace("{text}", text.replace('"','\\"'));

  // 发送请求
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: prompt
  });

  hideLoading();

  // 处理响应
  const translationResult = await response.json();
  return translationResult;
}

function showTranslation(translationResult) {
  browser.tabs.executeScript({
    code: `
      (function() {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "50%";
        overlay.style.left = "50%";
        overlay.style.transform = "translate(-50%, -50%)";
        overlay.style.backgroundColor = "white";
        overlay.style.border = "1px solid #ccc";
        overlay.style.padding = "20px";
        overlay.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
        overlay.style.zIndex = "9999";

        const content = document.createElement("p");
        content.textContent = "${translationResult.replace(/\n/g, "\\n")}";
        overlay.appendChild(content);

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.style.display = "block";
        closeButton.style.margin = "10px auto 0";
        closeButton.onclick = function() {
          overlay.remove();
        };
        overlay.appendChild(closeButton);

        document.body.appendChild(overlay);
      })();
    `
  });
}

// 监听用户选择文本的事件
browser.contextMenus.create({
  id: "translate",
  title: "Ollama translate",
  contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate") {
    const selectedText = info.selectionText;

    showLoading();

    // 发送HTTP POST请求到你的API
    sendTranslationRequest(selectedText).then(translationResult => {
      hideLoading();
      showTranslation(translationResult.response);
    });
  }
});