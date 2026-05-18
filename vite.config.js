// ─────────────────────────────────────────────────────────────────
// vite.config.js  –  Vite Build-Konfiguration
//
// Vite ist das Build-Tool das:
//   • 'npm run dev'   → lokalen Entwicklungsserver startet (HMR)
//   • 'npm run build' → fertiges Bundle in /dist schreibt
//
// defineConfig(): Gibt TypeScript-Autovervollständigung auch in .js
//
// plugins: [react()]  – aktiviert das offizielle Vite React-Plugin.
//   Dieses Plugin:
//     • Verarbeitet JSX (wandelt <Button /> in React.createElement um)
//     • Aktiviert Fast Refresh (Hot Module Replacement für React-
//       Komponenten – Änderungen im Editor erscheinen sofort im
//       Browser ohne Seitenreload oder State-Verlust)
//
// Keine weiteren Einstellungen nötig – Vite erkennt
// src/main.jsx automatisch als Einstiegspunkt.
// ─────────────────────────────────────────────────────────────────

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()] })
