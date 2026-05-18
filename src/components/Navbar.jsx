// ─────────────────────────────────────────────────────────────────
// src/components/Navbar.jsx  –  Globale Navigationsleiste
//
// Immer am oberen Bildschirmrand sichtbar (position: sticky).
// Enthält: Logo, Suchfeld, Navigations-Icons, Theme-Toggle.
//
// Props:
//   mode          ('dark'|'light') – aktueller Theme-Modus
//   onToggleMode  (function)       – Callback zum Umschalten in App.jsx
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import AppBar      from '@mui/material/AppBar'
import Toolbar     from '@mui/material/Toolbar'
import Typography  from '@mui/material/Typography'
import IconButton  from '@mui/material/IconButton'
import InputBase   from '@mui/material/InputBase'
import Box         from '@mui/material/Box'
import Tooltip     from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'

// Kleine Icon-Komponenten als Emoji – kein Icon-Paket nötig
const SearchIcon = () => <span style={{ fontSize: 18 }}>🔍</span>
const SunIcon    = () => <span style={{ fontSize: 18 }}>☀️</span>
const MoonIcon   = () => <span style={{ fontSize: 18 }}>🌙</span>

// NAV_ITEMS: Außerhalb der Komponente definiert, weil sich das Array
// nie ändert. Würde es innen stehen, würde ein neues Array bei
// jedem Re-Render erstellt – unnötige Speicherallokation.
const NAV_ITEMS = [
  { label: 'Home',      to: '/',          icon: '🏠' },
  { label: 'Favoriten', to: '/favorites', icon: '❤️' },
  { label: 'Verlauf',   to: '/history',   icon: '🕐' },
]

export default function Navbar({ mode, onToggleMode }) {

  // searchVal: Lokaler State für das Suchfeld.
  // Nur Navbar braucht diesen Wert – kein globaler State nötig.
  const [searchVal, setSearchVal] = useState('')

  const navigate  = useNavigate()   // Programmatische Navigation
  const location  = useLocation()   // Gibt aktuellen URL-Pfad zurück
  const theme     = useTheme()      // Zugriff auf MUI-Theme (für text.primary)
  const isDark    = mode === 'dark'

  // Farben direkt aus dem mode berechnen statt aus dem Theme,
  // weil AppBar background separat vom Paper-Hintergrund gesetzt wird.
  const navBg      = isDark ? '#13131A' : '#FFFFFF'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'

  // handleSearch: Verhindert Browser-Reload (e.preventDefault),
  // navigiert dann zu /search?q=... mit dem eingegebenen Suchbegriff.
  // encodeURIComponent wandelt Leerzeichen und Sonderzeichen in URL-sichere Zeichen um.
  // setSearchVal('') leert das Suchfeld nach dem Absenden.
  function handleSearch(e) {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`)
      setSearchVal('')
    }
  }

  return (
    // elevation={0}: Kein MUI-Schatten – stattdessen manueller border-bottom.
    // position="sticky": Klebt am oberen Rand beim Scrollen.
    <AppBar position="sticky" elevation={0}
      sx={{ background: navBg, borderBottom: `1px solid ${borderColor}` }}>
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>

        {/* ── Logo ──────────────────────────────────────────────
            Typography als Link-Komponente via component={Link}.
            MUI's sx-System und React Router's Link kombiniert:
            Kein <a href> nötig, kein Seitenreload. */}
        <Typography
          component={Link}
          to="/"
          sx={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, letterSpacing: 1,
            // Gradient-Text per WebKit-Clip-Technik:
            // backgroundClip: 'text' beschneidet den Hintergrund auf den Text.
            // WebkitTextFillColor: 'transparent' macht die Schrift selbst unsichtbar,
            // sodass der Hintergrund (Gradient) durchscheint.
            background: 'linear-gradient(135deg, #FF2D55, #BF5FFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none', mr: 1, flexShrink: 0,
          }}
        >
          Moodflix
        </Typography>

        {/* ── Suchfeld ──────────────────────────────────────────
            component="form" + onSubmit: Enter-Taste löst handleSearch aus.
            InputBase statt TextField: schlanker, kein Label/Rahmen,
            perfekt für Navbar-integrierte Suche. */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex', alignItems: 'center',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            borderRadius: 2, px: 1.5, py: 0.5, width: 220,
          }}
        >
          <SearchIcon />
          <InputBase
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Film suchen..."
            sx={{ ml: 1, flex: 1, fontSize: 14, color: theme.palette.text.primary }}
          />
        </Box>

        {/* ── Navigations-Icons ─────────────────────────────────
            location.pathname === to prüft ob wir auf dieser Seite sind.
            Active = visuell hervorgehoben (halbtransparenter Hintergrund). */}
        <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
          {NAV_ITEMS.map(({ label, to, icon }) => {
            const active = location.pathname === to
            return (
              <Tooltip key={to} title={label} placement="bottom">
                <IconButton
                  component={Link}
                  to={to}
                  size="small"
                  sx={{
                    fontSize: 18,
                    background: active
                      ? (isDark ? 'rgba(191,95,255,0.12)' : 'rgba(124,58,237,0.08)')
                      : 'transparent',
                    borderRadius: 2,
                    opacity: active ? 1 : 0.55,  // Inaktive Icons gedimmt
                    '&:hover': {
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      opacity: 1,
                    },
                  }}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            )
          })}
        </Box>

        {/* ── Theme-Toggle ──────────────────────────────────────
            Ruft onToggleMode() in App.jsx auf – von dort wird
            das Theme neu berechnet und an alle Kinder weitergegeben. */}
        <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'} placement="bottom">
          <IconButton
            onClick={onToggleMode}
            size="small"
            sx={{ fontSize: 18, opacity: 0.7, '&:hover': { opacity: 1 } }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </IconButton>
        </Tooltip>

      </Toolbar>
    </AppBar>
  )
}
