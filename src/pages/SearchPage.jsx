// ─────────────────────────────────────────────────────────────────
// src/pages/SearchPage.jsx  –  Filmsuche
//
// Sucht Filme per OMDB-API anhand eines Stichworts.
// Der Suchbegriff wird als URL-Parameter ?q=... gespeichert,
// damit die Suche teilbar/bookmarkbar ist.
//
// Aufruf über: Navbar-Suchfeld → /search?q=Inception
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Box              from '@mui/material/Box'
import Typography       from '@mui/material/Typography'
import InputBase        from '@mui/material/InputBase'
import Grid             from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import { searchFilms } from '../services/omdb'
import FilmCard from '../components/FilmCard'

// Suchfeld-Icon als SVG (kein externes Icon-Paket)
const SearchIconSvg = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function SearchPage() {

  // useSearchParams: React Router Hook zum Lesen/Schreiben von URL-Parametern.
  // searchParams.get('q') → aktueller Suchbegriff aus der URL
  // setSearchParams({ q: '...' }) → URL aktualisieren (kein Seitenreload)
  const [searchParams, setSearchParams] = useSearchParams()

  // Lokaler State für das Suchfeld – initialisiert aus der URL
  const [query,    setQuery]    = useState(searchParams.get('q') || '')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  // searched: Unterscheidet "noch nicht gesucht" von "gesucht, keine Ergebnisse"
  const [searched, setSearched] = useState(false)

  // Wenn die Seite mit ?q=... geladen wird (z.B. über Navbar-Suche),
  // direkt die Suche starten.
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q) }
  }, [])
  // Leeres Dependency-Array: nur beim ersten Render

  // doSearch: Führt die eigentliche Suche durch.
  // Ausgelagert aus handleSubmit damit sie auch vom useEffect aufgerufen werden kann.
  async function doSearch(q) {
    if (!q?.trim()) return
    setLoading(true)
    setSearched(true)
    const data = await searchFilms(q)
    setResults(data)
    setLoading(false)
  }

  // handleSubmit: Verhindert Browser-Reload, aktualisiert URL und startet Suche.
  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      // URL aktualisieren – das macht die Suche bookmarkbar und ermöglicht
      // dem Nutzer den Zurück-Button zu nutzen.
      setSearchParams({ q: query.trim() })
      doSearch(query.trim())
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Filmsuche
      </Typography>

      {/* Suchformular – Enter sendet ab (via onSubmit auf dem form) */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          // theme-Callback direkt im sx-Prop – Zugriff auf Theme ohne useTheme Hook
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.05)',
          borderRadius: 2, px: 2, py: 1, mb: 4, maxWidth: 480,
        }}
      >
        <SearchIconSvg />
        <InputBase
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filmtitel eingeben..."
          sx={{ flex: 1, fontSize: 15 }}
          autoFocus  // Cursor direkt ins Suchfeld beim Laden der Seite
        />
      </Box>

      {/* Lade-Spinner */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Keine Ergebnisse – aber nur nach einer Suche */}
      {!loading && searched && results.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontSize: 40, mb: 1 }}>🎬</Typography>
          <Typography color="text.secondary">
            Keine Ergebnisse für „{searchParams.get('q')}"
          </Typography>
        </Box>
      )}

      {/* Suchergebnisse */}
      {!loading && results.length > 0 && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            {results.length} Ergebnisse
          </Typography>
          <Grid container spacing={2}>
            {results.map(film => (
              <Grid item xs={6} sm={4} md={3} key={film.imdbID}>
                <FilmCard film={film} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Initialer Zustand: Noch nicht gesucht */}
      {!searched && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: 48, mb: 1 }}>🎭</Typography>
          <Typography color="text.secondary">Gib einen Filmtitel ein um zu suchen.</Typography>
        </Box>
      )}
    </Box>
  )
}
