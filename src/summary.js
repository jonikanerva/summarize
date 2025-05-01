document.addEventListener("DOMContentLoaded", () => {
  const out = document.querySelector(".openai-summary-html");
  const settingsBtn = document.getElementById("open-settings");
  const reloadBtn = document.getElementById("reload-summary");
  reloadBtn.addEventListener("click", generateSummary);
  settingsBtn.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: "../html/settings.html" });
    }
  });
  const params = new URLSearchParams(location.search);
  const tabId = Number(params.get("tabId"));
  if (!tabId) {
    out.innerHTML = "<p>No active tab detected.</p>";
    return;
  }

  function generateSummary() {
    out.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
        <p>Generating summary...</p>
      </div>
    `;
    chrome.tabs.sendMessage(tabId, { action: "extractContent" }, (resp) => {
      if (!resp || !resp.success) {
        out.innerHTML = `<p>Error extracting: ${resp?.error}</p>`;
        return;
      }

      if (resp.title) {
        document.title = `Summary: ${resp.title}`;
      }

      chrome.runtime.sendMessage(
        { action: "summarizeArticle", articleContent: resp },
        (res) => {
          if (res.success) {
            out.innerHTML = res.summary;
          } else {
            out.innerHTML = `<p>Summarization failed: ${res.error}</p>`;
          }
        }
      );
    });
  }

  // initial summary generation
  generateSummary();
});
