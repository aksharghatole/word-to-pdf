(() => {
  "use strict";

  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const statusEl = document.getElementById("status");

  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  const ALLOWED = [".docx", ".doc", ".odt", ".rtf", ".txt"];

  function setStatus(message, kind = "") {
    statusEl.hidden = false;
    statusEl.className = `status ${kind}`.trim();
    statusEl.textContent = message;
  }

  function clearStatus() {
    statusEl.hidden = true;
    statusEl.textContent = "";
    statusEl.className = "status";
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
    if (file.size > MAX_SIZE) {
      return "File too large (max 20 MB).";
    }
    if (file.size === 0) {
      return "File is empty.";
    }
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

  async function uploadFile(file) {
    const error = validate(file);
    if (error) {
      setStatus(error, "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    dropZone.classList.add("busy");
    setStatus(`Converting ${file.name}…`, "busy");

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let detail = `Server error (${res.status})`;
        try {
          const data = await res.json();
          if (data && data.detail) detail = data.detail;
        } catch {
          /* non-JSON error body — keep default message */
        }
        throw new Error(detail);
      }

      const blob = await res.blob();
      downloadBlob(blob, pdfNameFor(file.name));
      setStatus(`Done — ${pdfNameFor(file.name)} downloaded.`, "success");
    } catch (err) {
      setStatus(err.message || "Conversion failed.", "error");
    } finally {
      dropZone.classList.remove("busy");
      fileInput.value = "";
    }
  }

  // Click to open file picker
  dropZone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) uploadFile(file);
  });

  // Drag & drop
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

  // Prevent browser from opening dropped files outside the drop zone
  ["dragover", "drop"].forEach((evt) => {
    window.addEventListener(evt, (e) => {
      if (!dropZone.contains(e.target)) e.preventDefault();
    });
  });

  // Clear status when user starts another interaction
  dropZone.addEventListener("click", () => {
    if (statusEl.classList.contains("error")) clearStatus();
  });
})();
