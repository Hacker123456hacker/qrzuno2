/* QRZuno — app.js
   Wires a QR type (from tools-data.js) to a live form + preview +
   customization panel + download/copy/history/favorites. One engine
   powers every generator page. */

function qzInitGenerator(rootId, typeKey, opts = {}) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const tool = QRZUNO_TOOLS[typeKey];
  if (!tool) { root.innerHTML = "<p>Unknown QR type.</p>"; return; }

  const state = {
    data: {},
    size: 512,
    ec: "M",
    pattern: "square",
    fg: "#6d28d9",
    fgTo: "#06b6d4",
    useGradient: true,
    bg: "#ffffff",
    frame: "none",
    frameText: "SCAN ME",
    frameColor: "#6d28d9",
    logo: null,
    logoSizePct: 0.2,
    logoMargin: 10,
    logoBg: "#ffffff"
  };
  tool.fields.forEach(f => { if (f.default) state.data[f.key] = f.default; else if (f.type === "select") state.data[f.key] = f.options[0]; });

  root.innerHTML = `
    <div class="qz-gen-grid">
      <div class="qz-gen-col qz-card qz-glass">
        <h2 class="qz-gen-title">${tool.icon} ${qzEscapeHtml(tool.label)}</h2>
        <p class="qz-gen-desc">${qzEscapeHtml(tool.desc)}</p>
        ${tool.note ? `<p class="qz-note">${qzEscapeHtml(tool.note)}</p>` : ""}
        <form id="qz-form-${typeKey}" class="qz-form" novalidate></form>
        <p class="qz-error" id="qz-error-${typeKey}" role="alert" aria-live="polite"></p>

        <details class="qz-customize" open>
          <summary>Customize QR</summary>
          <div class="qz-custom-grid">
            <label class="qz-field">Foreground <input type="color" id="qz-fg-${typeKey}" value="${state.fg}"></label>
            <label class="qz-field qz-checkbox"><input type="checkbox" id="qz-usegrad-${typeKey}" ${state.useGradient ? "checked" : ""}> Use gradient</label>
            <label class="qz-field" id="qz-fgto-wrap-${typeKey}">Gradient end <input type="color" id="qz-fgto-${typeKey}" value="${state.fgTo}"></label>
            <label class="qz-field">Background <input type="color" id="qz-bg-${typeKey}" value="${state.bg}"></label>
            <label class="qz-field">Pattern
              <select id="qz-pattern-${typeKey}">
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="dots">Dots</option>
              </select>
            </label>
            <label class="qz-field">Error correction
              <select id="qz-ec-${typeKey}">
                <option value="L">L — ~7% recovery</option>
                <option value="M" selected>M — ~15% recovery</option>
                <option value="Q">Q — ~25% recovery</option>
                <option value="H">H — ~30% recovery (best with logos)</option>
              </select>
            </label>
            <label class="qz-field">Size
              <select id="qz-size-${typeKey}">
                <option value="256">256 × 256</option>
                <option value="512" selected>512 × 512</option>
                <option value="1024">1024 × 1024</option>
              </select>
            </label>
            <label class="qz-field">Frame
              <select id="qz-frame-${typeKey}">
                <option value="none">No frame</option>
                <option value="simple">Simple</option>
                <option value="rounded">Rounded</option>
                <option value="scanme">Scan Me</option>
                <option value="scanhere">Scan Here</option>
                <option value="custom">Custom text</option>
              </select>
            </label>
            <label class="qz-field" id="qz-frametext-wrap-${typeKey}" hidden>Frame text
              <input type="text" id="qz-frametext-${typeKey}" maxlength="20" value="SCAN ME">
            </label>
            <label class="qz-field">Logo (optional)
              <input type="file" id="qz-logo-${typeKey}" accept="image/*">
            </label>
            <label class="qz-field">Logo size <input type="range" id="qz-logosize-${typeKey}" min="10" max="30" value="20"></label>
          </div>
          <p class="qz-hint">Tip: large logos or busy patterns can make a QR code harder to scan. Test after downloading.</p>
        </details>

        <div class="qz-actions">
          <button type="button" class="qz-btn qz-btn-ghost" id="qz-reset-${typeKey}">Reset</button>
          <button type="button" class="qz-btn qz-btn-ghost" id="qz-copy-${typeKey}">Copy data</button>
          <button type="button" class="qz-btn qz-btn-ghost" id="qz-fav-${typeKey}">☆ Favorite</button>
        </div>
      </div>

      <div class="qz-gen-col qz-preview-col">
        <div class="qz-card qz-glass qz-preview-card">
          <div class="qz-preview-frame" id="qz-preview-wrap-${typeKey}">
            <div class="qz-empty-state" id="qz-empty-${typeKey}">
              <svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true">
                <rect x="8" y="8" width="40" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="6"/>
                <rect x="72" y="8" width="40" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="6"/>
                <rect x="8" y="72" width="40" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="6"/>
                <rect x="80" y="80" width="10" height="10" fill="currentColor"/>
                <rect x="100" y="80" width="10" height="10" fill="currentColor"/>
                <rect x="80" y="100" width="10" height="10" fill="currentColor"/>
              </svg>
              <p>Your QR code will appear here</p>
            </div>
            <canvas id="qz-canvas-${typeKey}" class="qz-canvas" hidden></canvas>
          </div>
          <div class="qz-download-row">
            <button type="button" class="qz-btn qz-btn-primary" id="qz-png-${typeKey}">Download PNG</button>
            <button type="button" class="qz-btn qz-btn-outline" id="qz-jpg-${typeKey}">Download JPG</button>
            <button type="button" class="qz-btn qz-btn-outline" id="qz-svg-${typeKey}">Download SVG</button>
          </div>
        </div>
      </div>
    </div>`;

  const form = document.getElementById(`qz-form-${typeKey}`);
  tool.fields.forEach(f => form.appendChild(qzBuildField(f, typeKey)));

  const $ = (id) => document.getElementById(id);
  const errorEl = $(`qz-error-${typeKey}`);
  const canvas = $(`qz-canvas-${typeKey}`);
  const emptyEl = $(`qz-empty-${typeKey}`);
  let currentPayload = "";
  let logoImg = null;

  function collect() {
    tool.fields.forEach(f => {
      const el = $(`qz-input-${typeKey}-${f.key}`);
      if (!el) return;
      state.data[f.key] = f.type === "checkbox" ? el.checked : el.value;
    });
  }

  function render() {
    collect();
    const err = tool.validate(state.data);
    if (err) {
      errorEl.textContent = err;
      canvas.hidden = true; emptyEl.hidden = false;
      currentPayload = "";
      return;
    }
    errorEl.textContent = "";
    try {
      currentPayload = tool.build(state.data);
      const matrix = qrzunoBuildMatrix(currentPayload, state.ec);
      qrzunoDrawToCanvas(canvas, matrix, {
        size: state.size, fg: state.fg, fgTo: state.useGradient ? state.fgTo : null,
        bg: state.bg, pattern: state.pattern, logo: logoImg, logoSizePct: state.logoSizePct,
        logoMargin: state.logoMargin, logoBg: state.logoBg, frame: state.frame,
        frameText: state.frameText, frameColor: state.frameColor
      });
      canvas.hidden = false; emptyEl.hidden = true;
    } catch (e) {
      errorEl.textContent = "Something went wrong. Please try again.";
      canvas.hidden = true; emptyEl.hidden = false;
    }
  }

  form.addEventListener("input", qzDebounce(render, 150));
  form.addEventListener("change", render);

  $(`qz-fg-${typeKey}`).addEventListener("input", (e) => { state.fg = e.target.value; render(); });
  $(`qz-fgto-${typeKey}`).addEventListener("input", (e) => { state.fgTo = e.target.value; render(); });
  $(`qz-bg-${typeKey}`).addEventListener("input", (e) => { state.bg = e.target.value; render(); });
  $(`qz-usegrad-${typeKey}`).addEventListener("change", (e) => {
    state.useGradient = e.target.checked;
    $(`qz-fgto-wrap-${typeKey}`).style.opacity = state.useGradient ? "1" : "0.4";
    render();
  });
  $(`qz-pattern-${typeKey}`).addEventListener("change", (e) => { state.pattern = e.target.value; render(); });
  $(`qz-ec-${typeKey}`).addEventListener("change", (e) => { state.ec = e.target.value; render(); });
  $(`qz-size-${typeKey}`).addEventListener("change", (e) => { state.size = parseInt(e.target.value, 10); render(); });
  $(`qz-frame-${typeKey}`).addEventListener("change", (e) => {
    state.frame = e.target.value;
    $(`qz-frametext-wrap-${typeKey}`).hidden = state.frame !== "custom";
    if (state.frame === "scanme") state.frameText = "SCAN ME";
    if (state.frame === "scanhere") state.frameText = "SCAN HERE";
    render();
  });
  $(`qz-frametext-${typeKey}`).addEventListener("input", (e) => { state.frameText = e.target.value || "SCAN ME"; render(); });
  $(`qz-logosize-${typeKey}`).addEventListener("input", (e) => { state.logoSizePct = parseInt(e.target.value, 10) / 100; render(); });
  $(`qz-logo-${typeKey}`).addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) { logoImg = null; render(); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => { logoImg = img; render(); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  $(`qz-reset-${typeKey}`).addEventListener("click", () => {
    form.reset();
    logoImg = null;
    $(`qz-logo-${typeKey}`).value = "";
    render();
    qzToast("Form reset.", "success");
  });
  $(`qz-copy-${typeKey}`).addEventListener("click", () => {
    if (!currentPayload) { qzToast("Nothing to copy yet.", "error"); return; }
    qzCopyText(currentPayload);
  });
  $(`qz-fav-${typeKey}`).addEventListener("click", () => {
    if (!currentPayload) { qzToast("Generate a QR code first.", "error"); return; }
    qzAddFavorite({ type: typeKey, label: tool.label, data: { ...state.data } });
    qzToast("Added to favorites.", "success");
  });

  ["qz-png", "qz-jpg", "qz-svg"].forEach(prefix => {
    $(`${prefix}-${typeKey}`).addEventListener("click", () => {
      if (!currentPayload) { qzToast("Please fix the errors above first.", "error"); return; }
      const filename = `qrzuno-${typeKey}-qr.${prefix.split("-")[1]}`;
      if (prefix === "qz-svg") {
        const matrix = qrzunoBuildMatrix(currentPayload, state.ec);
        const svg = qrzunoBuildSVG(matrix, { size: state.size, fg: state.fg, fgTo: state.useGradient ? state.fgTo : null, bg: state.bg, pattern: state.pattern });
        qzDownloadSVG(svg, filename);
      } else {
        qzDownloadCanvasAs(canvas, prefix === "qz-jpg" ? "jpg" : "png", filename);
      }
      qzSaveHistoryEntry({ type: typeKey, label: tool.label, data: { ...state.data } });
    });
  });

  render();
}

function qzBuildField(f, typeKey) {
  const wrap = document.createElement("label");
  wrap.className = f.type === "checkbox" ? "qz-field qz-checkbox" : "qz-field";
  const id = `qz-input-${typeKey}-${f.key}`;

  if (f.type === "textarea") {
    wrap.innerHTML = `${qzEscapeHtml(f.label)}${f.counter ? `<span class="qz-counter" id="${id}-counter">0/${f.maxlength}</span>` : ""}
      <textarea id="${id}" name="${f.key}" rows="4" placeholder="${qzEscapeHtml(f.placeholder || "")}" ${f.maxlength ? `maxlength="${f.maxlength}"` : ""}></textarea>`;
    if (f.counter) {
      const ta = wrap.querySelector("textarea");
      const counter = wrap.querySelector(`#${id}-counter`);
      ta.addEventListener("input", () => { counter.textContent = `${ta.value.length}/${f.maxlength}`; });
    }
  } else if (f.type === "select") {
    wrap.innerHTML = `${qzEscapeHtml(f.label)}
      <select id="${id}" name="${f.key}">${f.options.map(o => `<option value="${qzEscapeHtml(o)}">${qzEscapeHtml(o)}</option>`).join("")}</select>`;
  } else if (f.type === "checkbox") {
    wrap.innerHTML = `<input type="checkbox" id="${id}" name="${f.key}"> ${qzEscapeHtml(f.label)}`;
  } else {
    wrap.innerHTML = `${qzEscapeHtml(f.label)}
      <input type="${f.type}" id="${id}" name="${f.key}" placeholder="${qzEscapeHtml(f.placeholder || "")}">`;
  }
  return wrap;
}
