/* QRZuno — favorites.js
   Favorited QR configurations, stored locally only. No account needed. */

const QZ_FAV_KEY = "qrzuno_favorites_v1";

function qzGetFavorites() {
  try { return JSON.parse(localStorage.getItem(QZ_FAV_KEY)) || []; }
  catch { return []; }
}

function qzAddFavorite(entry) {
  const list = qzGetFavorites();
  list.unshift({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), ts: Date.now(), ...entry });
  localStorage.setItem(QZ_FAV_KEY, JSON.stringify(list));
}

function qzRemoveFavorite(id) {
  localStorage.setItem(QZ_FAV_KEY, JSON.stringify(qzGetFavorites().filter(e => e.id !== id)));
}
