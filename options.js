document.addEventListener('DOMContentLoaded', (event) => {
  const storedData = browser.storage.local.get('promptTemplate');
  storedData.then((data) => {
    const promptTemplate = data.promptTemplate || `{
	"model": "llama3",
	"prompt": "Translate to Traditional Chinese:{text}",
	"stream": false
}`;
    document.getElementById('promptTemplate').value = promptTemplate;
  });
});

document.getElementById('save').addEventListener('click', () => {
  const promptTemplate = document.getElementById('promptTemplate').value;
  browser.storage.local.set({promptTemplate: promptTemplate});
  alert("Saved");
});