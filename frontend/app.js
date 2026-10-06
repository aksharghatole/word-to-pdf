(() => {
  "use strict";

  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const statusEl = document.getElementById("status");

  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  const ALLOWED = [".docx", ".doc", ".odt", ".rtf", ".txt"];

  let lastFile = null;

  function setStatus(html, kind = "") {
    statusEl.hidden = false;
    statusEl.className = `status ${kind}`.trim();
    statusEl.innerHTML = html;
  }

  function clearStatus() {
    statusEl.hidden = true;
    statusEl.innerHTML = "";
    statusEl.className = "status";
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function extOf(name) {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i).toLowerCase() : "";
  }

  function pdfNameFor(name) {
    const i = name.lastIndexOf(".");
    const base = i >= 0 ? name.slice(0, i) : name;
    return `${base}.pdf`;
  }

  function validate(file) {
    if (!file) return "No file selected.";
    if (!ALLOWED.includes(extOf(file.name))) {
      return `Unsupported file type. Allowed: ${ALLOWED.join(", ")}`;
    }
    if (file.size > MAX_SIZE) return "File too large (max 20 MB).";
    if (file.size === 0) return "File is empty.";
    return null;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function renderBusy(filename) {
    setStatus(
      `<span class="spinner" aria-hidden="true"></span>
       <span>Converting <strong>${escapeHtml(filename)}</strong>…</span>`,
      "busy"
    );
  }

  function renderSuccess(filename, downloadName) {
    setStatus(
      `<div class="status-row">
         <svg class="status-icon success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
           <path d="M20 6 9 17l-5-5"/>
         </svg>
         <div>
           <div class="status-title">Done — ${escapeHtml(downloadName)} downloaded.</div>
           <div class="status-sub">Original: ${escapeHtml(filename)}</div>
         </div>
       </div>
       <button type="button" class="action" id="convert-another">Convert another</button>`,
      "success"
    );
    const btn = document.getElementById("convert-another");
    if (btn) {
      btn.addEventListener("click", () => {
        clearStatus();
        fileInput.click();
      });
    }
  }

  function renderError(message) {
    setStatus(
      `<div class="status-row">
         <svg class="status-icon error" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
           <circle cx="12" cy="12" r="10"/>
           <path d="M12 8v4M12 16h.01"/>
         </svg>
         <div>
           <div class="status-title">Conversion failed</div>
           <div class="status-sub">${escapeHtml(message)}</div>
         </div>
       </div>
       <button type="button" class="action" id="retry">Try again</button>`,
      "error"
    );
    const btn = document.getElementById("retry");
    if (btn) {
      btn.addEventListener("click", () => {
        if (lastFile) {
          uploadFile(lastFile);
        } else {
          clearStatus();
          fileInput.click();
        }
      });
    }
  }

  async function uploadFile(file) {
    const error = validate(file);
    if (error) {
      lastFile = null;
      renderError(error);
      return;
    }

    lastFile = file;

    const formData = new FormData();
    formData.append("file", file);

    dropZone.classList.add("busy");
    renderBusy(file.name);

    try {
      const res = await fetch("/api/convert", { method: "POST", body: formData });

      if (!res.ok) {
        let detail = `Server error (${res.status})`;
        try {
          const data = await res.json();
          if (data && data.detail) detail = data.detail;
        } catch { /* non-JSON body */ }
        throw new Error(detail);
      }

      const blob = await res.blob();
      const downloadName = pdfNameFor(file.name);
      downloadBlob(blob, downloadName);
      renderSuccess(file.name, downloadName);
    } catch (err) {
      renderError(err.message || "Conversion failed.");
    } finally {
      dropZone.classList.remove("busy");
      fileInput.value = "";
    }
  }

  // Click to open file picker (ignore clicks that landed on inner buttons)
  dropZone.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) uploadFile(file);
  });

  ["dragenter", "dragover"].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (evt === "dragleave" && e.target !== dropZone) return;
      dropZone.classList.remove("dragover");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) uploadFile(file);
  });

  ["dragover", "drop"].forEach((evt) => {
    window.addEventListener(evt, (e) => {
      if (!dropZone.contains(e.target)) e.preventDefault();
    });
  });
})();