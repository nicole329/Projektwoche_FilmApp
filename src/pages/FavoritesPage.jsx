// ─────────────────────────────────────────────────────────────────
// src/pages/FavoritesPage.jsx  –  Favoriten-Übersicht
//
// Zeigt alle vom Nutzer gespeicherten Filme als Grid an.
// Liest Daten aus dem localStorage über die storage-Service-Funktionen.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Box        from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid       from '@mui/material/Grid'
import { getFavorites } from '../services/storage'
import FilmCard from '../components/FilmCard'

export default function FavoritesPage() {

  // favs: Array der gespeicherten Favoriten.
  // Wird beim ersten Render aus dem localStorage geladen.
  const [favs, setFavs] = useState([])

  // Initialer Load: Favoriten aus localStorage lesen.
  // Leeres Dependency-Array [] = läuft nur einmal nach dem ersten Render.
  useEffect(() => {
    setFavs(getFavorites())
  }, [])

  // Focus-Refresh: Wenn der Nutzer von der Detailseite zurückkommt
  // (wo er evtl. einen Favoriten entfernt hat), muss die Liste aktualisiert werden.
  // 'focus'-Event auf window feuert wenn der Browser-Tab wieder aktiv wird.
  // Cleanup: Event-Listener beim Unmount entfernen (verhindert Memory Leaks).
  useEffect(() => {
    const onFocus = () => setFavs(getFavorites())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Favoriten</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {/* Singular/Plural: '1 Film' vs '2 Filme' */}
        {favs.length} {favs.length === 1 ? 'Film' : 'Filme'} gespeichert
      </Typography>

      {/* Leerer Zustand: Freundliche Aufforderung statt leerer Seite */}
      {favs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ fontSize: 48, mb: 1 }}>🤍</Typography>
          <Typography color="text.secondary">Noch keine Favoriten.</Typography>
          <Typography variant="caption" color="text.secondary">
            Klicke auf das Herz-Symbol bei einem Film um ihn zu speichern.
          </Typography>
        </Box>
      ) : (
        // Responsive Grid: 2 Spalten auf Mobil, 3 auf Tablet, 4 auf Desktop
        <Grid container spacing={2}>
          {favs.map(film => (
            <Grid item xs={6} sm={4} md={3} key={film.imdbID}>
              <FilmCard film={film} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
