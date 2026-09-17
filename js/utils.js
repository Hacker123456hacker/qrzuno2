/* QRZuno — utils.js */

function qzToast(message, type = "success") {
  let host = document.getElementById("qz-toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "qz-toast-host";
    host.className = "qz-toast-host";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = `qz-toast qz-toast-${type}`;
  el.setAttribute("role", "status");
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

function qzInitChrome() {
  // mobile menu
  const btn = document.querySelector(".qz-hamburger");
  const menu = document.querySelector(".qz-mobile-menu");
  if (btn && menu) {
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("qz-no-scroll", open);
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("qz-no-scroll");
    }));
  }
  // sticky header
  const header = document.querySelector(".qz-header");
  if (header) {
    let last = window.scrollY;
    window.addEventListener("scroll", () => {
      header.classList.toggle("qz-header-scrolled", window.scrollY > 8);
      last = window.scrollY;
    }, { passive: true });
  }
  // active nav link
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".qz-nav a, .qz-mobile-menu a").forEach(a => {
    if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
  });
  // year in footer
  document.querySelectorAll(".qz-year").forEach(el => el.textContent = new Date().getFullYear());
  // register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function qzDebounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function qzEscapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

document.addEventListener("DOMContentLoaded", qzInitChrome);
