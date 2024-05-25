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
        loadingText.textContent = "正在处理中，请稍候...";
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

async function sendTranslationRequest(text) {
  var req = {
    model: "llama3",
    prompt: "请将后面的文本翻译为简体中文，仅回复翻译结果即可：" + text,
    stream: false
  };

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req)
  });

  hideLoading();

  return response.json();
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
        closeButton.textContent = "关闭";
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
  title: "翻译选中的文本",
  contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate") {
    const selectedText = info.selectionText;

    showLoading();

    // 发送HTTP POST请求到你的API
    sendTranslationRequest(selectedText).then(translationResult => {
      hideLoading();
      console.log(translationResult);
      showTranslation(translationResult.response);
    });
  }
});