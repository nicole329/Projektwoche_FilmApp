// ─────────────────────────────────────────────────────────────────
// src/theme/theme.js  –  MUI Theme-Konfiguration
//
// Definiert das visuelle Design der gesamten App für hell und dunkel.
// Alle MUI-Komponenten (Button, Card, Typography usw.) beziehen
// ihre Farben, Schriften und Abstände aus diesem Theme.
//
// Aufgerufen von: App.jsx → ThemeProvider
// ─────────────────────────────────────────────────────────────────

import { createTheme } from '@mui/material/styles'

// getTheme(mode): Erstellt ein vollständiges MUI-Theme-Objekt.
// Wird in App.jsx mit useMemo gecacht – nur neu erstellt wenn mode wechselt.
//
// Parameter:
//   mode: 'dark' | 'light'
export function getTheme(mode) {
  return createTheme({
    palette: {
      // mode teilt MUI mit ob Hell- oder Dunkel-Modus aktiv ist.
      // MUI passt automatisch viele Farben an (Hintergrund, Text, Divider...).
      mode,

      // Überschreibe die Standard-MUI-Farben je nach Modus:
      ...(mode === 'dark'
        ? {
            // Dunkler Modus: Fast-Schwarz mit leichtem Blau-Stich
            background: {
              default: '#0A0A0F',   // Seitenhintergrund
              paper:   '#13131A',   // Karten, Modals, AppBar
            },
            primary:   { main: '#BF5FFF' },  // Lila – dominante Akzentfarbe
            secondary: { main: '#FF2D55' },  // Rot/Pink – sekundäre Akzente
          }
        : {
            // Heller Modus: Warmes Off-White
            background: {
              default: '#F5F4FA',  // Leicht lila getönt, nicht hartes Weiß
              paper:   '#FFFFFF',
            },
            primary:   { main: '#7C3AED' },  // Dunkleres Lila für Lesbarkeit
            secondary: { main: '#E11D48' },  // Dunkleres Rot für Lesbarkeit
          }),
    },

    typography: {
      // DM Sans: Moderne, runde Sans-Serif – für Fließtext und Labels.
      // Bebas Neue (für das Logo) wird direkt in den Komponenten als
      // inline-Style gesetzt, nicht hier – weil es nur einmal vorkommt.
      fontFamily: "'DM Sans', sans-serif",
    },

    // Globaler Border-Radius – MUI multipliziert diesen Wert.
    // 12px gibt allen Karten, Buttons und Dialogen abgerundete Ecken.
    shape: { borderRadius: 12 },

    // Globale Überschreibungen für einzelne MUI-Komponenten:
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            // MUI schreibt Buttons standardmäßig in GROSSBUCHSTABEN.
            // 'none' bewahrt die Groß-/Kleinschreibung aus dem JSX.
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            // MUI Paper hat im Dark Mode einen eingebauten hellen Verlauf (elevation overlay).
            // 'none' entfernt diesen, damit Karten die exakte paper-Farbe zeigen.
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}
