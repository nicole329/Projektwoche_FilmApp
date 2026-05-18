// ─────────────────────────────────────────────────────────────────
// api/omdb.js  –  Vercel Serverless Function (läuft auf dem SERVER)
//
// Gleiche Sicherheitsarchitektur wie api/ai.js:
// Der OMDB API Key verlässt den Server nie.
//
// Diese Funktion unterstützt drei Anfrage-Typen in einem Endpunkt:
//   'title'  → Film nach exaktem Titel suchen (1 Ergebnis)
//   'id'     → Film nach IMDB-ID laden (vollständige Daten)
//   'search' → Stichwortsuche (Liste von Ergebnissen)
//
// Endpunkt: POST /api/omdb
// Body:     { type: 'title'|'id'|'search', value: string }
// Antwort:  direkt das OMDB JSON-Objekt
// ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // OMDB API Key aus sicherer Serverumgebung laden.
  const apiKey = process.env.OMDB_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'OMDB API key not configured on server' })
  }

  const { type, value } = req.body

  if (!type || !value) {
    return res.status(400).json({ error: 'type and value are required' })
  }

  // ── URL-Aufbau je nach Anfrage-Typ ───────────────────────────
  // OMDB nutzt Query-Parameter statt REST-Pfade.
  // encodeURIComponent() schützt Sonderzeichen in Titeln
  // (z.B. "Amélie" → "Am%C3%A9lie" damit die URL gültig bleibt).
  let url
  if (type === 'title') {
    // ?t=  → Titelsuche, gibt genau einen Film zurück (den bekanntesten Treffer)
    // plot=short → kurze Inhaltsangabe (ausreichend für FilmCard)
    url = `https://www.omdbapi.com/?t=${encodeURIComponent(value)}&apikey=${apiKey}&plot=short`

  } else if (type === 'id') {
    // ?i=  → Suche nach IMDB-ID (z.B. "tt1375666")
    // plot=full → vollständige Inhaltsangabe für die Detailseite
    url = `https://www.omdbapi.com/?i=${encodeURIComponent(value)}&apikey=${apiKey}&plot=full`

  } else if (type === 'search') {
    // ?s=  → Volltextsuche, gibt Array mit bis zu 10 Treffern zurück
    // type=movie → nur Filme, keine Serien oder Spiele
    url = `https://www.omdbapi.com/?s=${encodeURIComponent(value)}&type=movie&apikey=${apiKey}`

  } else {
    // Unbekannter Typ → sofort mit Fehlermeldung antworten
    return res.status(400).json({ error: 'type must be title, id, or search' })
  }

  try {
    // Server-zu-Server Anfrage: Der Key ist in der URL, aber diese URL
    // sieht nur unser Server – nie der Browser des Nutzers.
    const response = await fetch(url)
    const data     = await response.json()

    // OMDB-Ergebnis unverändert weiterleiten.
    // Die Normalisierung (OMDB-Felder → unsere Felder) passiert
    // in src/services/omdb.js auf der Frontend-Seite.
    return res.status(200).json(data)

  } catch (error) {
    console.error('OMDB API error:', error)
    return res.status(500).json({ error: 'Failed to fetch from OMDB' })
  }
}
