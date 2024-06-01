document.addEventListener('DOMContentLoaded', (event) => {
  const storedData = browser.storage.local.get('promptTemplate');
  storedData.then((data) => {
    const promptTemplate = data.promptTemplate || `{
	"model": "llama3",
	"prompt": "请译为简体中文，仅回复翻译结果：{text}",
	"stream": false
}`;
    document.getElementById('promptTemplate').value = promptTemplate;
  });
});

document.getElementById('save').addEventListener('click', () => {
  const promptTemplate = document.getElementById('promptTemplate').value;
  browser.storage.local.set({promptTemplate: promptTemplate});
  alert("保存成功。");
});