// ─────────────────────────────────────────────────────────────────
// src/App.jsx  –  Wurzelkomponente der Anwendung
//
// App.jsx ist der "Dirigent": Sie kennt keine Filmdaten und zeichnet
// keine UI, aber sie orchestriert drei Schlüsselsysteme:
//
//   1. Theme-System  → Hell/Dunkel-Modus via MUI ThemeProvider
//   2. Router        → URL-basierte Navigation via React Router
//   3. Layout        → Navbar + Seiteninhalt via <Routes>
//
// Alle anderen Komponenten sind Kinder von App.jsx.
// ─────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './theme/theme'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import FilmDetailPage from './pages/FilmDetailPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {

  // mode: Aktueller Theme-Modus ('dark' | 'light').
  // Startwert 'dark' – die App ist primär als Kino-Erlebnis im Dark Mode designt.
  // Wird von Navbar über onToggleMode umgeschaltet.
  const [mode, setMode] = useState('dark')

  // useMemo: Theme-Objekt wird nur neu berechnet wenn 'mode' sich ändert.
  // Ohne useMemo würde bei JEDEM Re-Render (z.B. Tippen in der Suchleiste)
  // ein komplett neues Theme-Objekt erstellt → unnötige Arbeit.
  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    // ThemeProvider: Macht das Theme-Objekt für alle Kindkomponenten
    // über useTheme() und MUI-sx-Props verfügbar.
    <ThemeProvider theme={theme}>

      {/* CssBaseline: MUI's globaler CSS-Reset.
          Entfernt Browser-Standardstyles (margin, padding, box-sizing)
          und setzt background-color basierend auf dem Theme. */}
      <CssBaseline />

      {/* BrowserRouter: Aktiviert URL-basiertes Routing.
          Alle Route-Komponenten müssen innerhalb des Routers liegen.
          "Browser" bedeutet: echte URLs (/search, /film/tt123) statt Hash (#/search). */}
      <BrowserRouter>

        {/* Navbar ist immer sichtbar – außerhalb der Routes.
            Bekommt mode und den Toggle-Callback als Props:
            - mode:          damit Navbar den richtigen Icon anzeigt (☀️/🌙)
            - onToggleMode:  damit Navbar den Modus in App.jsx ändern kann */}
        <Navbar
          mode={mode}
          onToggleMode={() => setMode(m => m === 'dark' ? 'light' : 'dark')}
        />

        {/* Routes: Zeigt immer nur die erste <Route> an, deren 'path'
            zur aktuellen URL passt. */}
        <Routes>
          {/* / → Startseite mit Rouletterad */}
          <Route path="/"             element={<HomePage />} />

          {/* /search?q=... → Suche (query-Parameter wird in SearchPage gelesen) */}
          <Route path="/search"       element={<SearchPage />} />

          {/* /film/:imdbId → Detailseite, :imdbId ist ein URL-Parameter
              z.B. /film/tt1375666 → imdbId = "tt1375666"
              Wird in FilmDetailPage via useParams() ausgelesen */}
          <Route path="/film/:imdbId" element={<FilmDetailPage />} />

          {/* /favorites → Gespeicherte Favoriten */}
          <Route path="/favorites"    element={<FavoritesPage />} />

          {/* /history → Zuletzt angesehene Filme */}
          <Route path="/history"      element={<HistoryPage />} />
        </Routes>

      </BrowserRouter>
    </ThemeProvider>
  )
}
