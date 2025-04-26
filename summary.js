document.addEventListener("DOMContentLoaded", () => {
  const out = document.querySelector(".openai-summary-html");
  const settingsBtn = document.getElementById("open-settings");
  settingsBtn.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: "settings.html" });
    }
  });
  out.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
        <p>Generating summary...</p>
      </div>
    `;

  const params = new URLSearchParams(location.search);
  const tabId = Number(params.get("tabId"));
  if (!tabId) {
    out.innerHTML = "<p>Ei aktiivista välilehteä.</p>";
    return;
  }

  chrome.tabs.sendMessage(tabId, { action: "extractContent" }, (resp) => {
    if (!resp || !resp.success) {
      out.innerHTML = `<p>Error extracting: ${resp?.error}</p>`;
      return;
    }
    chrome.runtime.sendMessage(
      { action: "summarizeArticle", articleContent: resp.content },
      (res) => {
        if (res.success) {
          out.innerHTML = res.summary;
        } else {
          out.innerHTML = `<p>Summarointi epäonnistui: ${res.error}</p>`;
        }
      }
    );
  });
});
