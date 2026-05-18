// ─────────────────────────────────────────────────────────────────
// src/pages/HistoryPage.jsx  –  Verlauf der angesehenen Filme
//
// Ähnlich wie FavoritesPage, aber ohne Focus-Refresh.
// Zeigt die letzten 50 Filme (Limit in storage.js) in umgekehrter
// chronologischer Reihenfolge (neueste zuerst).
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Box        from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid       from '@mui/material/Grid'
import Button     from '@mui/material/Button'
import { getHistory, clearHistory } from '../services/storage'
import FilmCard from '../components/FilmCard'

export default function HistoryPage() {
  const [history, setHistory] = useState([])

  // Verlauf einmalig laden
  useEffect(() => { setHistory(getHistory()) }, [])

  // handleClear: Löscht den localStorage-Eintrag und leert den lokalen State.
  // Kein Bestätigungs-Dialog – der Button ist explizit genug.
  function handleClear() {
    clearHistory()
    setHistory([])
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
      {/* Header mit optionalem Löschen-Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="h5" fontWeight={700}>Verlauf</Typography>
        {/* Löschen-Button nur anzeigen wenn es Einträge gibt */}
        {history.length > 0 && (
          <Button size="small" color="error" variant="outlined" onClick={handleClear}>
            Verlauf löschen
          </Button>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Zuletzt angesehene Filme
      </Typography>

      {/* Leerer Zustand */}
      {history.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ fontSize: 48, mb: 1 }}>📽️</Typography>
          <Typography color="text.secondary">Noch kein Verlauf.</Typography>
          <Typography variant="caption" color="text.secondary">
            Filme die du anklickst erscheinen hier.
          </Typography>
        </Box>
      ) : (
        // key: imdbID + viewedAt verhindert Schlüssel-Konflikte wenn
        // ein Film mehrfach angesehen und wieder in den Verlauf aufgenommen wird.
        <Grid container spacing={2}>
          {history.map(film => (
            <Grid item xs={6} sm={4} md={3} key={film.imdbID + film.viewedAt}>
              <FilmCard film={film} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
