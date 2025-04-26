document.addEventListener("DOMContentLoaded", () => {
  const out = document.querySelector(".openai-summary-html");
  out.innerHTML = "<p>Loading…</p>";

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
