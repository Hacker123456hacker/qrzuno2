/* QRZuno — history.js
   Everything is stored in localStorage on the user's own device. Nothing
   is ever uploaded to a server. */

const QZ_HISTORY_KEY = "qrzuno_history_v1";
const QZ_HISTORY_MAX = 60;

function qzGetHistory() {
  try { return JSON.parse(localStorage.getItem(QZ_HISTORY_KEY)) || []; }
  catch { return []; }
}

function qzSaveHistoryEntry(entry) {
  const list = qzGetHistory();
  list.unshift({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), ts: Date.now(), ...entry });
  localStorage.setItem(QZ_HISTORY_KEY, JSON.stringify(list.slice(0, QZ_HISTORY_MAX)));
}

function qzDeleteHistoryEntry(id) {
  localStorage.setItem(QZ_HISTORY_KEY, JSON.stringify(qzGetHistory().filter(e => e.id !== id)));
}

function qzClearHistory() {
  localStorage.removeItem(QZ_HISTORY_KEY);
}
