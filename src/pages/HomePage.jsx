// ─────────────────────────────────────────────────────────────────
// src/pages/HomePage.jsx  –  Startseite mit Rouletterad
//
// Koordiniert die gesamte "Drehen → Stimmung → Filme"-Interaktion.
// Verwaltet alle relevanten States und gibt sie als Props weiter.
//
// Datenfluss nach dem Drehen:
//   RouletteWheel → onResult(mood) → fetchFilmsForMood + getMoodComment
//                                   → films[], comment → FilmCard × 4
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box              from '@mui/material/Box'
import Typography       from '@mui/material/Typography'
import Grid             from '@mui/material/Grid'
import Chip             from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme }     from '@mui/material/styles'
import RouletteWheel    from '../components/RouletteWheel'
import FilmCard         from '../components/FilmCard'
import { fetchFilmsForMood } from '../services/omdb'
import { getMoodComment }    from '../services/ai'
import { addToHistory }      from '../services/storage'

export default function HomePage() {

  // ── State-Verwaltung ──────────────────────────────────────────
  // Alle States die sich beim Drehen ändern:

  // spinning: Steuert ob das Rad sich dreht.
  // Wird zwischen HomePage und RouletteWheel geteilt – beide müssen es wissen.
  // HomePage: zeigt keinen Lade-Spinner während spinning=true
  // RouletteWheel: deaktiviert den Spin-Button während spinning=true
  const [spinning,       setSpinning]       = useState(false)

  // mood: Das Stimmungs-Objekt nach dem Drehen (z.B. { label: 'Happy', color: '#F0C27F', ... })
  // null = noch nicht gedreht oder gerade am Drehen
  const [mood,           setMood]           = useState(null)

  // films: Array der 4 geladenen Film-Objekte (OMDB-Daten + lokale Daten)
  const [films,          setFilms]          = useState([])

  // comment: KI-Kommentar als String oder null
  const [comment,        setComment]        = useState(null)

  // Separate Loading-States für Filme und KI-Kommentar,
  // weil beide Anfragen parallel laufen und unabhängig fertig werden.
  const [loadingFilms,   setLoadingFilms]   = useState(false)
  const [loadingComment, setLoadingComment] = useState(false)

  const theme  = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // ── Ergebnis-Handler ─────────────────────────────────────────
  // handleResult(selectedMood): Wird von RouletteWheel aufgerufen wenn:
  //   a) Das Rad stoppt  → selectedMood ist ein Stimmungs-Objekt
  //   b) Ein neuer Spin startet → selectedMood ist null (Reset)
  async function handleResult(selectedMood) {
    if (!selectedMood) {
      // Neuer Spin → alles zurücksetzen
      setMood(null); setFilms([]); setComment(null)
      return
    }

    setMood(selectedMood)
    setFilms([])
    setComment(null)
    setLoadingFilms(true)
    setLoadingComment(true)

    // ── Parallele API-Anfragen ──────────────────────────────────
    // BEIDE Anfragen werden gleichzeitig gestartet (nicht await dann await).
    // .then() statt await weil wir nicht auf beide warten wollen –
    // jede aktualisiert ihren eigenen State sobald sie fertig ist.
    // Das ermöglicht progressive Darstellung: Kommentar erscheint
    // sobald er fertig ist, Filme sobald sie fertig sind.

    // Filme laden: selectedMood.films enthält die 4 lokalen Film-Objekte aus moods.js
    fetchFilmsForMood(selectedMood.films).then(enriched => {
      setFilms(enriched)
      setLoadingFilms(false)
      // Jeden Film zum Verlauf hinzufügen (nur wenn OMDB-ID vorhanden)
      enriched.forEach(f => { if (f.imdbID) addToHistory(f) })
    })

    // KI-Kommentar laden: nur Titel-Array übergeben, nicht die ganzen Objekte
    getMoodComment(selectedMood.label, selectedMood.films.map(f => f.name)).then(text => {
      setComment(text)
      setLoadingComment(false)
    })
  }

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Dezentes Raster-Muster im Dark Mode als visueller Hintergrund.
          position: 'fixed' damit es beim Scrollen mitläuft.
          pointerEvents: 'none' damit es keine Klicks abfängt. */}
      {isDark && (
        <Box sx={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage:
            'linear-gradient(rgba(191,95,255,0.04) 1px,transparent 1px),' +
            'linear-gradient(90deg,rgba(191,95,255,0.04) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      )}

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 700, mx: 'auto', px: 2, py: 5 }}>

        {/* Titel-Bereich */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{
            fontFamily: "'Bebas Neue', sans-serif",
            // clamp(min, preferred, max): Responsive Schriftgröße ohne Media Queries.
            // Wächst mit dem Viewport, aber nie kleiner als 52px oder größer als 88px.
            fontSize: 'clamp(52px,10vw,88px)',
            letterSpacing: 2, lineHeight: 1,
            background: 'linear-gradient(135deg, #FF2D55, #BF5FFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Moodflix
          </Typography>
          <Typography variant="caption" sx={{
            color: 'text.secondary', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Dreh das Rad · Entdecke deinen Film
          </Typography>
        </Box>

        {/* Rouletterad */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
          <RouletteWheel
            onResult={handleResult}  // Callback wenn Rad stoppt
            spinning={spinning}      // Aktueller Spin-Status
            setSpinning={setSpinning} // Damit RouletteWheel den Status setzen kann
          />
        </Box>

        {/* Ergebnis-Bereich: Nur anzeigen wenn mood gesetzt ist */}
        {mood && (
          <Box sx={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 3, p: 3,
            // Einblend-Animation: von unten nach oben, gleichzeitig Opacity 0→1.
            // '@keyframes' direkt in sx – kein separates CSS nötig.
            animation: 'fadeup .35s ease',
            '@keyframes fadeup': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to:   { opacity: 1, transform: 'translateY(0)'    },
            },
          }}>
            {/* Stimmungs-Chip mit Emoji und Label */}
            <Chip
              label={`${mood.emoji} ${mood.label}`}
              size="small"
              sx={{ mb: 1.5, background: mood.color + '33', color: mood.color, fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
              {mood.desc}
            </Typography>

            {/* KI-Kommentar: Lade-Indikator oder fertiger Text */}
            {loadingComment && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CircularProgress size={12} />
                <Typography variant="caption" color="text.secondary">KI denkt nach...</Typography>
              </Box>
            )}
            {comment && (
              // Zitat-Stil: linker farbiger Rand, kursiv
              <Box sx={{
                borderLeft: `3px solid ${mood.color}`, pl: 1.5, mb: 2.5,
                fontStyle: 'italic', fontSize: 13, color: 'text.secondary', lineHeight: 1.7,
              }}>
                {comment}
              </Box>
            )}

            {/* Filmkarten: Lade-Spinner oder 2×2 Grid */}
            {loadingFilms ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress size={24} />
                <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                  Filme werden geladen...
                </Typography>
              </Box>
            ) : (
              // xs=6: 2 Karten nebeneinander auf Mobilgeräten
              // sm=3: 4 Karten nebeneinander ab kleinen Tablets
              <Grid container spacing={1.5}>
                {films.map(film => (
                  <Grid item xs={6} sm={3} key={film.name}>
                    <FilmCard film={film} accentColor={mood.color} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
