class CodeExplainer {
  constructor() {
    this.history = JSON.parse(localStorage.getItem("codeHistory")) || [];
    this.currentResult = null;
  }

  renderHistory() {
    const ul = document.getElementById("history-list");
    if (!ul) return;

    ul.innerHTML = "";
    this.history.forEach((item, index) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item list-group-item-action history-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <span class="badge bg-secondary">${item.lang}</span><br>
          <small class="font-monospace text-truncate d-block" style="max-width:220px;">${item.codeSnippet}</small>
        </div>
        <small class="text-white">${item.timestamp}</small>
      `;
      li.onclick = () => this.loadHistoryItem(index);
      ul.appendChild(li);
    });
  }

  saveHistory() {
    localStorage.setItem("codeHistory", JSON.stringify(this.history));
    this.renderHistory();
  }

  clearHistory() {
    if (confirm("Clear all history?")) {
      this.history = [];
      localStorage.removeItem("codeHistory");
      this.renderHistory();
    }
  }

  loadHistoryItem(index) {
    this.currentResult = this.history[index];
    this.showResult();
  }

  addToHistory(result) {
    const snippet =
      result.originalCode.substring(0, 60).replace(/\n/g, " ") + "...";

    this.history.unshift({
      id: Date.now(),
      lang: result.lang,
      codeSnippet: snippet,
      originalCode: result.originalCode,
      explanation: result.explanation,
      complexity: result.complexity,
      optimized: result.optimized,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    if (this.history.length > 20) this.history.pop();
    this.saveHistory();
  }

  showResult() {
    const resultArea = document.getElementById("result-area");
    if (!resultArea || !this.currentResult) return;

    resultArea.classList.remove("d-none");

    document.getElementById("result-lang").textContent = this.currentResult.lang;

    const origDiv = document.getElementById("original-code");
    origDiv.innerHTML = `<pre><code class="language-${this.currentResult.lang.toLowerCase()}">${this.escapeHtml(
      this.currentResult.originalCode
        )}</code></pre>`;
    hljs.highlightAll();

    document.getElementById("explanation").innerHTML = 
      `<p class="mb-0">${this.currentResult.explanation}</p>`;

    document.getElementById("complexity").innerHTML = 
      `<p class="mb-0">${this.currentResult.complexity}</p>`;

    const optDiv = document.getElementById("optimized-code");
    if (
      this.currentResult.optimized &&
      this.currentResult.optimized !== "No optimization needed"
    ) {
      optDiv.innerHTML = `<pre><code class="language-${this.currentResult.lang.toLowerCase()}">${this.escapeHtml(
        this.currentResult.optimized
      )}</code></pre>`; 
      document.getElementById("optimized-note").innerHTML =
        `<strong>Side-by-side diff view:</strong> Compare manually or paste into any diff tool.`;
    } else {
      optDiv.innerHTML = `<p class="text-white">No meaningful optimization suggested.</p>`;
      document.getElementById("optimized-note").innerHTML = "";
    }
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async explainCode(lang, code) {
    const formData = new FormData();
    formData.append("lang", lang);
    formData.append("code", code);

    const response = await fetch(window.location.href, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Unknown error");

    return {
      lang,
      originalCode: code,
      explanation: data.explanation,
      complexity: data.complexity,
      optimized: data.optimized,
    };
  }

  copyCode() {
    if (!this.currentResult) return;

    navigator.clipboard.writeText(this.currentResult.originalCode).then(() => {
      const origBtn = document.querySelector("#original-code ~ button");
      if (origBtn) {
        origBtn.textContent = "Copied!";
        setTimeout(() => {
          if (origBtn) origBtn.textContent = "Copy Original";
        }, 1500);
      }
    });
  }
    detectLanguage(code) {
    const jsPatterns = /(function|console\.log|let |const |var |=>|document\.|;)/;
    const pyPatterns = /(def |print\(|import |elif |None|True|False)/;

    if (jsPatterns.test(code)) return "JavaScript";
    if (pyPatterns.test(code)) return "Python";

    return "Unknown";
    }
  init() {
    this.renderHistory();
    hljs.highlightAll();

    if (this.history.length === 0) {
      document.getElementById("result-area")?.classList.add("d-none");
    }

    const form = document.getElementById("code-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const lang = document.getElementById("lang")?.value;
        const code = document.getElementById("code")?.value.trim();

        if (!code || !lang) return;
        const detected = this.detectLanguage(code);

        if (detected !== "Unknown" && detected !== lang) {
        alert(
            `Selected language is ${lang} but the code looks like ${detected}.\nPlease select the correct language.`
        );
        return;
        }

        const btn = e.target.querySelector("button");
        const originalText = btn.textContent;

        try {
          btn.disabled = true;
          btn.textContent = "Thinking with Grok...";

          const result = await this.explainCode(lang, code);
          this.currentResult = result;
          this.addToHistory(result);
          this.showResult();

          btn.disabled = false;
          btn.textContent = originalText;
        } catch (err) {
          alert("Error: " + err.message + "\n\nCheck console and your API key.");
          console.error(err);
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });
    }
  }
}


const codeExplain = new CodeExplainer();
window.onload = () => {
  codeExplain.init();
};

window.clearHistory = () => codeExplain.clearHistory();
window.copyCode    = () => codeExplain.copyCode();