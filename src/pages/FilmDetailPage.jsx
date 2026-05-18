// ─────────────────────────────────────────────────────────────────
// src/pages/FilmDetailPage.jsx  –  Detailansicht eines Films
//
// Lädt vollständige Filmdaten anhand der IMDB-ID aus der URL
// und zeigt Poster, Metadaten, Plot, Favoriten-Button an.
//
// URL-Parameter: /film/:imdbId  (z.B. /film/tt1375666)
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box              from '@mui/material/Box'
import Typography       from '@mui/material/Typography'
import Chip             from '@mui/material/Chip'
import Button           from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { fetchFilmById } from '../services/omdb'
import { addFavorite, removeFavorite, isFavorite, addToHistory } from '../services/storage'

// Inline SVG Icons (kein extra Paket nötig)
const BackIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

export default function FilmDetailPage() {

  // useParams(): Liest den :imdbId Parameter aus der URL.
  // Beispiel: URL /film/tt1375666 → imdbId = "tt1375666"
  const { imdbId } = useParams()
  const navigate   = useNavigate()

  const [film,    setFilm]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [fav,     setFav]     = useState(false)

  // Filmdaten laden wenn die Seite geöffnet wird.
  // [imdbId] als Dependency: läuft erneut wenn zu einem anderen Film navigiert wird.
  useEffect(() => {
    fetchFilmById(imdbId).then(data => {
      setFilm(data)
      setLoading(false)
      if (data) {
        // Favoriten-Status initialisieren
        setFav(isFavorite(data.imdbID))
        // Zum Verlauf hinzufügen – Nutzer hat diesen Film angesehen
        addToHistory(data)
      }
    })
  }, [imdbId])

  function toggleFav() {
    if (fav) { removeFavorite(film.imdbID); setFav(false) }
    else      { addFavorite(film);          setFav(true)  }
  }

  // Lade-Zustand: Zentrierter Spinner während Daten kommen
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  )

  // Fehler-Zustand: Film nicht gefunden (OMDB gab null zurück)
  if (!film) return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography color="text.secondary">Film nicht gefunden.</Typography>
      <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Zurück</Button>
    </Box>
  )

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 4 }}>
      {/* navigate(-1) = Browser-Zurück-Button – springt in der History zurück */}
      <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}
        sx={{ mb: 3, color: 'text.secondary' }}>
        Zurück
      </Button>

      {/* flexWrap: 'wrap' – auf schmalen Bildschirmen stapeln sich Poster und Text */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Poster oder Platzhalter */}
        {film.poster ? (
          <Box component="img" src={film.poster} alt={film.title}
            sx={{ width: 200, borderRadius: 2, flexShrink: 0, alignSelf: 'flex-start', boxShadow: 4 }} />
        ) : (
          <Box sx={{ width: 200, height: 300, borderRadius: 2,
            background: 'rgba(128,128,128,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            🎬
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 200 }}>
          {/* Titel + Favorit-Button nebeneinander */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>{film.title}</Typography>
            <Button onClick={toggleFav} variant="outlined" size="small"
              startIcon={<HeartIcon filled={fav} />}
              sx={{
                color:       fav ? '#FF2D55' : 'text.secondary',
                borderColor: fav ? '#FF2D55' : 'divider',
                flexShrink: 0,
              }}>
              {fav ? 'Gespeichert' : 'Favorit'}
            </Button>
          </Box>

          {/* Metadaten-Zeile */}
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            {film.year}{film.runtime ? ` · ${film.runtime}` : ''}{film.rating ? ` · ⭐ ${film.rating}` : ''}
          </Typography>

          {/* Genre-Tags: film.genre ist ein komma-separierter String → aufteilen */}
          {film.genre && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {film.genre.split(', ').map(g => (
                <Chip key={g} label={g} size="small" variant="outlined" />
              ))}
            </Box>
          )}

          {film.plot     && <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 2 }}>{film.plot}</Typography>}
          {film.director && <Typography variant="caption" color="text.secondary" display="block">Regie: {film.director}</Typography>}
          {film.actors   && <Typography variant="caption" color="text.secondary" display="block">Besetzung: {film.actors}</Typography>}
        </Box>
      </Box>
    </Box>
  )
}
