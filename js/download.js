/* QRZuno — download.js
   All exports happen in the browser. Nothing is sent to a server. */

function qzDownloadCanvasAs(canvas, format, filename) {
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  canvas.toBlob((blob) => {
    if (!blob) { qzToast("Something went wrong. Please try again.", "error"); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    qzToast("QR code downloaded.", "success");
  }, mime, 0.95);
}

function qzDownloadSVG(svgString, filename) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  qzToast("QR code downloaded.", "success");
}

async function qzCopyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    qzToast("Copied successfully!", "success");
  } catch {
    qzToast("Copy isn't supported here — please copy manually.", "error");
  }
}
