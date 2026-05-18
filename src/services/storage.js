// ─────────────────────────────────────────────────────────────────
// src/services/storage.js  –  Lokale Datenpersistenz
//
// Liest und schreibt Favoriten und Verlauf im localStorage des Browsers.
// localStorage ist eine einfache Schlüssel-Wert-Datenbank im Browser:
//   • Überlebt Seitenneuladen und Browser-Tabs
//   • Wird NICHT gelöscht wenn der Tab geschlossen wird
//   • Limit: ca. 5 MB pro Domain
//   • Nur Text – daher JSON.stringify/parse für Objekte nötig
//
// Diese Datei exportiert reine Hilfsfunktionen (kein React-State).
// Aufgerufen wird sie von:
//   • FilmCard.jsx        → toggleFav, isFavorite
//   • FilmDetailPage.jsx  → addFavorite, removeFavorite, isFavorite, addToHistory
//   • FavoritesPage.jsx   → getFavorites
//   • HistoryPage.jsx     → getHistory, clearHistory
//   • HomePage.jsx        → addToHistory
// ─────────────────────────────────────────────────────────────────

// Schlüssel-Konstanten: Als Konstanten statt Magic Strings,
// damit Tippfehler im Editor auffallen und Suchen/Ersetzen einfach ist.
const FAV_KEY  = 'moodflix_favorites'
const HIST_KEY = 'moodflix_history'

// ── Favoriten ─────────────────────────────────────────────────────

// getFavorites(): Gibt das gespeicherte Favoriten-Array zurück.
// try/catch fängt den Fall ab, wenn die gespeicherten Daten korrupt sind
// (z.B. manuell im DevTools-Storage editiert wurden).
// Gibt im Fehlerfall ein leeres Array zurück, statt die App zum Absturz zu bringen.
export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || [] }
  catch { return [] }
}

// addFavorite(film): Fügt einen Film vorne an die Favoriten-Liste an.
// Verhindert Duplikate durch find()-Check auf imdbID.
// [film, ...favs] = neues Array mit film an erster Stelle, dann der Rest.
export function addFavorite(film) {
  const favs = getFavorites()
  // Doppelte Einträge verhindern (z.B. zweimaliges Klicken auf Herz)
  if (!favs.find(f => f.imdbID === film.imdbID)) {
    localStorage.setItem(FAV_KEY, JSON.stringify([film, ...favs]))
  }
}

// removeFavorite(imdbID): Entfernt den Film mit dieser ID per filter().
// filter() erstellt ein neues Array OHNE den gesuchten Film.
export function removeFavorite(imdbID) {
  const favs = getFavorites().filter(f => f.imdbID !== imdbID)
  localStorage.setItem(FAV_KEY, JSON.stringify(favs))
}

// isFavorite(imdbID): Gibt true/false zurück – reine Prüffunktion.
// some() gibt true zurück sobald ein Element die Bedingung erfüllt,
// ohne das gesamte Array durchzulaufen.
export function isFavorite(imdbID) {
  return getFavorites().some(f => f.imdbID === imdbID)
}

// ── Verlauf ───────────────────────────────────────────────────────

// getHistory(): Gibt das gespeicherte Verlaufs-Array zurück.
export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY)) || [] }
  catch { return [] }
}

// addToHistory(film): Fügt den angesehenen Film an den Anfang des Verlaufs.
// Besonderheiten:
//   1. filter: Entfernt zuerst einen älteren Eintrag desselben Films
//              (verhindert Duplikate, neuester Eintrag gewinnt).
//   2. viewedAt: Timestamp in Millisekunden – für späteres Sortieren nutzbar.
//   3. .slice(0, 50): Verlauf auf maximal 50 Einträge begrenzen,
//      damit localStorage nicht überfüllt wird.
export function addToHistory(film) {
  const hist = getHistory().filter(f => f.imdbID !== film.imdbID)
  localStorage.setItem(
    HIST_KEY,
    JSON.stringify([{ ...film, viewedAt: Date.now() }, ...hist].slice(0, 50))
  )
}

// clearHistory(): Löscht den gesamten Verlauf-Eintrag aus dem localStorage.
// removeItem löscht den Key komplett – getHistory() gibt danach [] zurück.
export function clearHistory() {
  localStorage.removeItem(HIST_KEY)
}
