// ─────────────────────────────────────────────────────────────────
// src/main.jsx  –  Einstiegspunkt der React-Anwendung
//
// Diese Datei ist der allerste JavaScript-Code der im Browser läuft.
// Vite (unser Build-Tool) liest index.html, findet <script src="main.jsx">
// und startet hier.
//
// Aufgabe: React in das <div id="root"> in der index.html einbauen.
// ─────────────────────────────────────────────────────────────────

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ReactDOM.createRoot(): Modern React 18 API (statt dem alten ReactDOM.render).
// document.getElementById('root') findet das leere <div> in index.html.
// Alle React-Komponenten werden darin gerendert.
ReactDOM.createRoot(document.getElementById('root')).render(

  // React.StrictMode: Entwicklungsmodus-Hilfstool.
  //   • Ruft Komponenten und Effekte doppelt auf um Probleme zu finden
  //   • Warnt vor veralteten API-Nutzungen
  //   • Wird in Production-Builds automatisch entfernt – kein Overhead
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
