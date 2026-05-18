// ─────────────────────────────────────────────────────────────────
// src/components/FilmCard.jsx  –  Wiederverwendbare Filmkarte
//
// Zeigt einen Film als klickbare Karte mit Poster, Titel, Jahr,
// Bewertung und Favoriten-Herz an.
//
// Wird verwendet auf:
//   • HomePage     → 4 Filme nach dem Drehen des Rades
//   • FavoritesPage → alle gespeicherten Favoriten
//   • HistoryPage  → zuletzt angesehene Filme
//   • SearchPage   → Suchergebnisse
//
// Props:
//   film        (object)  – Film-Objekt (aus OMDB oder localStorage)
//   accentColor (string)  – optionale Stimmungsfarbe (nur auf HomePage)
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// MUI-Komponenten für strukturiertes Card-Layout
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
// Storage-Funktionen für Favoriten-Verwaltung
import { isFavorite, addFavorite, removeFavorite } from '../services/storage'

// HeartIcon: Eigenes SVG statt MUI-Icons-Paket.
// 'filled': wenn true → ausgefülltes Herz (Favorit gesetzt)
//           wenn false → nur Umriss (noch kein Favorit)
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

export default function FilmCard({ film, accentColor }) {
  const navigate = useNavigate()

  // fav: Lokaler State – true wenn dieser Film in den Favoriten ist.
  // Initialisierungsfunktion () => isFavorite(...) wird nur EINMAL
  // beim ersten Render ausgeführt (lazy initial state).
  const [fav, setFav] = useState(() => isFavorite(film.imdbID))

  // toggleFav: Herz-Button-Handler.
  // e.stopPropagation() verhindert dass der Klick an den CardActionArea
  // (Navigations-Button) weitergegeben wird – sonst würde die Detailseite
  // gleichzeitig mit dem Favoriten-Toggle geöffnet.
  function toggleFav(e) {
    e.stopPropagation()
    if (fav) { removeFavorite(film.imdbID); setFav(false) }
    else      { addFavorite(film);          setFav(true)  }
  }

  // Defensive Feldnamen-Auflösung: Film-Objekte aus verschiedenen Quellen
  // können unterschiedliche Feldnamen haben:
  //   OMDB-Daten (normalisiert in omdb.js):  film.poster, film.title
  //   OMDB-Rohdaten (aus searchFilms):       film.Poster, film.Title
  //   Lokale moods.js-Daten:                film.name
  const poster = film.Poster && film.Poster !== 'N/A' ? film.Poster : film.poster
  const title  = film.Title  || film.title  || film.name
  const year   = film.Year   || film.year
  const rating = film.imdbRating || film.rating

  return (
    // position: 'relative' + height: '100%': Die Karte füllt die Grid-Zelle.
    // 'relative' ist nötig damit der absolute-positionierte Herz-Button funktioniert.
    <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* CardActionArea: Macht die ganze Karte klickbar.
          onClick navigiert zur Detailseite – aber nur wenn imdbID existiert.
          Filme ohne OMDB-Daten haben keine ID und keine Detailseite. */}
      <CardActionArea
        onClick={() => film.imdbID && navigate(`/film/${film.imdbID}`)}
        sx={{ flex: 1 }}
      >
        {/* Poster oder Fallback-Icon */}
        {poster ? (
          <CardMedia
            component="img"
            height="180"
            image={poster}
            alt={title}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          // Kein Poster verfügbar → farbiger Platzhalter mit Film-Emoji
          // accentColor + '22' = Hex-Farbe mit 13% Deckkraft (als transparente Tönung)
          <Box sx={{
            height: 180,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: accentColor ? accentColor + '22' : 'rgba(128,128,128,0.1)',
            fontSize: 40,
          }}>
            🎬
          </Box>
        )}

        <CardContent sx={{ pb: 1 }}>
          {/* Kleiner Farbpunkt als Stimmungs-Akzent (nur auf HomePage) */}
          {accentColor && (
            <Box sx={{
              width: 3, height: 3, borderRadius: '50%',
              background: accentColor, mb: 0.5, display: 'inline-block', mr: 0.5,
            }} />
          )}
          {/* noWrap: Lange Titel werden mit "..." abgeschnitten.
              title-Attribut zeigt den vollen Namen als Browser-Tooltip. */}
          <Typography variant="body2" fontWeight={600} noWrap title={title}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {year}{rating ? ` · ⭐ ${rating}` : ''}
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* Herz-Button: Nur anzeigen wenn der Film eine IMDB-ID hat.
          Ohne ID können wir ihn nicht sicher als Favorit identifizieren. */}
      {film.imdbID && (
        <IconButton
          size="small"
          onClick={toggleFav}
          sx={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(0,0,0,0.5)',
            color: fav ? '#FF2D55' : '#fff',
            '&:hover': { background: 'rgba(0,0,0,0.7)' },
            width: 30, height: 30,
          }}
        >
          <HeartIcon filled={fav} />
        </IconButton>
      )}
    </Card>
  )
}
