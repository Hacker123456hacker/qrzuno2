/* QRZuno — qr-engine.js
   Wraps the qrcode-generator library and renders the matrix ourselves so we
   have full control over colors, gradients, dot/rounded patterns, eye
   styles, logo overlay and frames. Everything runs client-side. */

const QRZUNO_ECL = { L: "L", M: "M", Q: "Q", H: "H" };

function qrzunoBuildMatrix(data, ecLevel) {
  const qr = qrcode(0, ecLevel || "M"); // typeNumber 0 = auto-detect smallest size
  qr.addData(data);
  qr.make();
  const count = qr.getModuleCount();
  const matrix = [];
  for (let r = 0; r < count; r++) {
    const row = [];
    for (let c = 0; c < count; c++) row.push(qr.isDark(r, c));
    matrix.push(row);
  }
  return matrix;
}

function qrzunoIsEye(matrix, r, c) {
  const n = matrix.length;
  const inTL = r < 7 && c < 7;
  const inTR = r < 7 && c >= n - 7;
  const inBL = r >= n - 7 && c < 7;
  return inTL || inTR || inBL;
}

/**
 * Draws a QR matrix onto a canvas with full customization.
 * opts: { size, margin, fg, fgTo (gradient end, optional), bg, pattern
 *        ('square'|'rounded'|'dots'), logo (Image or null), logoSizePct,
 *        logoMargin, logoBg, frame ('none'|'simple'|'rounded'|'scanme'|'scanhere'|'custom'),
 *        frameText, frameColor }
 */
function qrzunoDrawToCanvas(canvas, matrix, opts) {
  const n = matrix.length;
  const size = opts.size || 512;
  const margin = Math.round(size * 0.06);
  const frameHeight = opts.frame && opts.frame !== "none" ? Math.round(size * 0.16) : 0;
  canvas.width = size;
  canvas.height = size + frameHeight;
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = opts.bg || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const inner = size - margin * 2;
  const cell = inner / n;

  let fillStyle = opts.fg || "#0f172a";
  if (opts.fgTo) {
    const grad = ctx.createLinearGradient(margin, margin, margin + inner, margin + inner);
    grad.addColorStop(0, opts.fg || "#0f172a");
    grad.addColorStop(1, opts.fgTo);
    fillStyle = grad;
  }
  ctx.fillStyle = fillStyle;

  const pattern = opts.pattern || "square";
  const drawModule = (x, y, w, h, eye) => {
    if (pattern === "dots") {
      const r = (Math.min(w, h) / 2) * (eye ? 0.92 : 0.82);
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (pattern === "rounded") {
      const r = Math.min(w, h) * (eye ? 0.28 : 0.32);
      qrzunoRoundRect(ctx, x, y, w, h, r);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
  };

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!matrix[r][c]) continue;
      const eye = qrzunoIsEye(matrix, r, c);
      drawModule(margin + c * cell, margin + r * cell, cell, cell, eye);
    }
  }

  // logo overlay
  if (opts.logo) {
    const logoSize = inner * (opts.logoSizePct || 0.2);
    const lx = (canvas.width - logoSize) / 2;
    const ly = margin + (inner - logoSize) / 2;
    const pad = opts.logoMargin != null ? opts.logoMargin : logoSize * 0.12;
    ctx.save();
    ctx.fillStyle = opts.logoBg || "#ffffff";
    qrzunoRoundRect(ctx, lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2, pad);
    ctx.fill();
    ctx.drawImage(opts.logo, lx, ly, logoSize, logoSize);
    ctx.restore();
  }

  // frame
  if (frameHeight) {
    ctx.fillStyle = opts.frameColor || "#0f172a";
    if (opts.frame === "rounded" || opts.frame === "scanme" || opts.frame === "scanhere") {
      qrzunoRoundRect(ctx, 0, size, size, frameHeight, 14);
      ctx.fill();
    } else {
      ctx.fillRect(0, size, size, frameHeight);
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(frameHeight * 0.42)}px Poppins, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = opts.frameText || (opts.frame === "scanhere" ? "SCAN HERE" : opts.frame === "scanme" ? "SCAN ME" : "SCAN ME");
    ctx.fillText(text, size / 2, size + frameHeight / 2);
  }

  return canvas;
}

function qrzunoRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Builds a standalone SVG string for the given matrix (no logo/frame — kept simple & scan-safe). */
function qrzunoBuildSVG(matrix, opts) {
  const n = matrix.length;
  const size = opts.size || 512;
  const margin = Math.round(size * 0.06);
  const inner = size - margin * 2;
  const cell = inner / n;
  const pattern = opts.pattern || "square";
  const fg = opts.fg || "#0f172a";
  const fgTo = opts.fgTo || null;

  let defs = "";
  let fillRef = fg;
  if (fgTo) {
    defs = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${fgTo}"/></linearGradient></defs>`;
    fillRef = "url(#g)";
  }

  let shapes = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!matrix[r][c]) continue;
      const x = margin + c * cell, y = margin + r * cell;
      if (pattern === "dots") {
        const rad = (cell / 2) * 0.82;
        shapes += `<circle cx="${(x + cell / 2).toFixed(2)}" cy="${(y + cell / 2).toFixed(2)}" r="${rad.toFixed(2)}"/>`;
      } else if (pattern === "rounded") {
        const rr = cell * 0.32;
        shapes += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="${rr.toFixed(2)}"/>`;
      } else {
        shapes += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${defs}<rect width="100%" height="100%" fill="${opts.bg || "#ffffff"}"/>
    <g fill="${fillRef}">${shapes}</g></svg>`;
}
