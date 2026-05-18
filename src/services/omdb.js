// ─────────────────────────────────────────────────────────────────
// src/services/omdb.js  –  Frontend-Proxy für Filmdaten
//
// Alle Filmanfragen gehen über unsere Vercel-Funktion /api/omdb,
// nie direkt an omdbapi.com. Grund: API-Key-Sicherheit (wie bei ai.js).
//
// Exportierte Funktionen:
//   fetchFilm(title)         → einzelner Film nach Titel (für Mood-Ergebnisse)
//   fetchFilmById(imdbId)    → einzelner Film nach IMDB-ID (für Detailseite)
//   searchFilms(query)       → Liste von Filmen nach Stichwort (für Suche)
//   fetchFilmsForMood(films) → alle 4 Filme einer Stimmung parallel laden
//
// Aufgerufen von:
//   HomePage.jsx        → fetchFilmsForMood
//   FilmDetailPage.jsx  → fetchFilmById
//   SearchPage.jsx      → searchFilms
// ─────────────────────────────────────────────────────────────────

// ── Interne Hilfsfunktion ─────────────────────────────────────────
// omdbRequest(type, value): Gemeinsame Basis für alle OMDB-Anfragen.
// Vermeidet Code-Wiederholung – alle drei Anfrage-Typen teilen sich
// denselben fetch()-Aufruf, unterscheiden sich nur in type/value.
//
// 'async function' erlaubt die Verwendung von 'await' innen.
async function omdbRequest(type, value) {
  try {
    const res = await fetch('/api/omdb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value }),
    })
    return await res.json()
  } catch {
    return null  // Netzwerkfehler → null zurückgeben, kein Absturz
  }
}

// ── Film nach Titel laden ─────────────────────────────────────────
// fetchFilm(title): Wird für die Mood-Ergebnisse verwendet.
// OMDB gibt bei 'title'-Suche immer genau einen Film zurück (den bekanntesten).
//
// Rückgabe: Normalisiertes Film-Objekt mit einheitlichen Feldnamen,
//   oder null wenn kein Film gefunden wurde.
//
// Warum normalisieren? OMDB-Feldnamen sind PascalCase (Title, Year, Poster...).
// Intern nutzen wir lowercase (title, year, poster...) – konsistenter.
export async function fetchFilm(title) {
  const data = await omdbRequest('title', title)
  if (!data || data.Response === 'False') return null
  return {
    imdbID:   data.imdbID,
    title:    data.Title,
    year:     data.Year,
    // Poster: 'N/A' ist OMDB's Weg "kein Bild vorhanden" zu sagen.
    // Wir wandeln das in null um, damit FilmCard den Fallback-Icon zeigt.
    poster:   data.Poster   !== 'N/A' ? data.Poster   : null,
    rating:   data.imdbRating !== 'N/A' ? data.imdbRating : null,
    plot:     data.Plot     !== 'N/A' ? data.Plot     : null,
    genre:    data.Genre    !== 'N/A' ? data.Genre    : null,
    director: data.Director !== 'N/A' ? data.Director : null,
    actors:   data.Actors   !== 'N/A' ? data.Actors   : null,
  }
}

// ── Film nach IMDB-ID laden ───────────────────────────────────────
// fetchFilmById(imdbId): Für die Detailseite – lädt vollständige Daten.
// Unterschied zu fetchFilm: zusätzlich 'runtime' und 'language',
// und OMDB liefert bei ID-Suche den vollen Plot (plot=full in api/omdb.js).
export async function fetchFilmById(imdbId) {
  const data = await omdbRequest('id', imdbId)
  if (!data || data.Response === 'False') return null
  return {
    imdbID:   data.imdbID,
    title:    data.Title,
    year:     data.Year,
    poster:   data.Poster     !== 'N/A' ? data.Poster     : null,
    rating:   data.imdbRating !== 'N/A' ? data.imdbRating : null,
    plot:     data.Plot       !== 'N/A' ? data.Plot       : null,
    genre:    data.Genre      !== 'N/A' ? data.Genre      : null,
    director: data.Director   !== 'N/A' ? data.Director   : null,
    actors:   data.Actors     !== 'N/A' ? data.Actors     : null,
    runtime:  data.Runtime    !== 'N/A' ? data.Runtime    : null,  // z.B. "148 min"
    language: data.Language   !== 'N/A' ? data.Language   : null,  // z.B. "English"
  }
}

// ── Stichwortsuche ────────────────────────────────────────────────
// searchFilms(query): Gibt ein Array von Suchergebnissen zurück.
// OMDB's 'search'-Typ gibt eine Liste zurück (max. 10 Einträge).
// Die Ergebnisse sind weniger detailliert (kein Plot, kein Rating) –
// für die Suchseite reicht das, Detailklick lädt mehr.
//
// Gibt [] zurück (leeres Array) wenn nichts gefunden – nie null,
// damit SearchPage direkt über results.map() iterieren kann.
export async function searchFilms(query) {
  const data = await omdbRequest('search', query)
  if (!data || data.Response !== 'True') return []
  // data.Search ist das Array mit den Treffern
  return data.Search
}

// ── Alle Filme einer Stimmung laden ──────────────────────────────
// fetchFilmsForMood(films): Lädt alle 4 Filme einer Stimmung gleichzeitig.
//
// Promise.all([...]) = parallele Ausführung:
//   Statt 4 Anfragen nacheinander (4 × ~300ms = 1200ms)
//   werden alle 4 gleichzeitig gestartet (max. ~300ms gesamt).
//
// films.map((f, i) => ...) kombiniert danach die lokalen Daten (name, desc)
// mit den OMDB-Daten (poster, rating...) per Spread-Operator.
// Falls OMDB null zurückgibt (Film nicht gefunden), bleiben lokale Daten erhalten.
export async function fetchFilmsForMood(films) {
  const results = await Promise.all(films.map(f => fetchFilm(f.name)))
  return films.map((f, i) => ({ ...f, ...(results[i] || {}) }))
  // { ...f }         → lokale Daten aus moods.js (name, desc)
  // { ...results[i]} → OMDB-Daten (überschreiben lokale wenn vorhanden)
  // || {}            → Fallback falls OMDB null zurückgab
}
