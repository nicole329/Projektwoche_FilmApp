// ─────────────────────────────────────────────────────────────────
// src/components/RouletteWheel.jsx  –  Das Herzstück der App
//
// Diese Komponente zeichnet das Rouletterad mit der HTML5 Canvas API
// und steuert die gesamte Spin-Animation per requestAnimationFrame.
//
// Warum Canvas statt CSS?  →  Ausführliche Diskussion im Handbuch
//
// Props:
//   onResult(mood|null)  – wird aufgerufen wenn das Rad stoppt;
//                          null = neuer Spin wurde gestartet
//   spinning (boolean)   – verhindert Doppelklicks
//   setSpinning(bool)    – setzt den Spin-Status im Parent (HomePage)
// ─────────────────────────────────────────────────────────────────

import { useRef, useEffect, useCallback } from 'react'
import { MOODS } from '../data/moods'
import { useTheme } from '@mui/material/styles'

// ── Konstanten ────────────────────────────────────────────────────
// N: Anzahl der Segmente – direkt aus dem MOODS-Array berechnet,
//    damit Änderungen in moods.js automatisch übernommen werden.
const N = MOODS.length

// ARC: Winkel eines einzelnen Segments in Bogenmass (Radiant).
//   Ein voller Kreis = 2π ≈ 6.28 Rad → geteilt durch N Segmente.
const ARC = (Math.PI * 2) / N

// ── Hilfsfunktion: Easing ─────────────────────────────────────────
// easeOut(t): Wandelt eine lineare Zeitstelle (0–1) in eine
// abbremsende Bewegung um. Das "Cubic Ease Out"-Prinzip:
//   t=0 → Ergebnis=0 (Anfang, noch keine Bewegung)
//   t=1 → Ergebnis=1 (Ende, vollständig gedreht)
//   Dazwischen: anfangs schnell, dann immer langsamer.
// Ohne Easing würde das Rad abrupt stoppen – sehr unnatürlich.
function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

export default function RouletteWheel({ onResult, spinning, setSpinning }) {

  // ── Refs ────────────────────────────────────────────────────────
  // useRef speichert Werte die sich zwischen Renders ändern,
  // OHNE einen Re-Render auszulösen – perfekt für Animationsdaten.

  // canvasRef: Direktzugriff auf das <canvas>-Element im DOM.
  const canvasRef = useRef(null)

  // angleRef: Der aktuelle Drehwinkel in Bogenmass (kumulativ, z.B. 47.3 rad).
  // Wird NICHT als State gespeichert, weil jedes Update einen
  // Re-Render ausgelöst hätte – bei 60fps wären das 60 Re-Renders/Sek.
  //
  // Startwert -ARC / 2: Verschiebt das Rad um ein halbes Segment,
  // damit "Happy" (Index 0) beim Laden exakt unter dem Zeiger liegt
  // und nicht auf einer Segmentgrenze steht.
  const angleRef = useRef(-ARC / 2)

  // rafRef: ID des laufenden requestAnimationFrame-Callbacks.
  // Wird beim Unmount verwendet um die Animation sauber abzubrechen.
  const rafRef = useRef(null)

  // theme/isDark: MUI-Theme für hell/dunkel-angepasste Farben
  // (Linienfarbe zwischen Segmenten, Hub-Farbe).
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // ── Zeichenfunktion ────────────────────────────────────────────
  // drawWheel(angle): Löscht das Canvas und zeichnet das komplette
  // Rad neu – bei jedem Animationsframe einmal aufgerufen.
  //
  // useCallback mit [isDark] als Dependency: Die Funktion wird
  // nur neu erstellt wenn sich der Theme-Modus ändert.
  const drawWheel = useCallback((angle) => {
    const canvas = canvasRef.current
    if (!canvas) return  // Guard: Canvas noch nicht im DOM
    const ctx = canvas.getContext('2d')

    // Mittelpunkt und Radius aus der Canvas-Größe berechnen.
    // -4 Pixel Abstand zum Rand für den Kreis-Stroke.
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 4

    // Komplettes Canvas löschen – bei Canvas gibt es kein "teilweises Neuzeichnen"
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // save/restore: Schützt den Koordinatenursprung.
    // Alles zwischen save() und restore() arbeitet im verschobenen System.
    ctx.save()

    // Koordinatenursprung in die Mitte verschieben,
    // damit ctx.arc(0,0,...) = Kreis in der Mitte.
    ctx.translate(cx, cy)

    // Das gesamte Rad mit dem aktuellen Winkel drehen.
    // angle wächst mit jedem Frame → Rad dreht sich.
    ctx.rotate(angle)

    // ── Segmente zeichnen ────────────────────────────────────────
    MOODS.forEach((m, i) => {
      // Jedes Segment startet bei seinem Index × Bogenmaß,
      // minus π/2 damit Segment 0 oben bei 12 Uhr beginnt.
      const start = i * ARC - Math.PI / 2
      const end   = start + ARC

      // Kuchenstück: Linie zur Mitte → Bogen → zurück zur Mitte
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, r, start, end)
      ctx.closePath()

      // Füllung und Rand des Segments
      ctx.fillStyle   = m.color
      ctx.fill()
      ctx.strokeStyle = isDark ? '#0A0A0F' : '#F5F4FA'  // passt zum Seitenhintergrund
      ctx.lineWidth   = 2
      ctx.stroke()

      // ── Text und Emoji ins Segment ──────────────────────────
      // save/rotate: Drehe das Canvas so, dass "rechts" = Richtung Segmentmitte.
      // Dann können wir einfach auf der X-Achse Abstände angeben.
      ctx.save()
      ctx.rotate(start + ARC / 2)     // Zeige in die Mitte des Segments
      ctx.textAlign = 'right'          // Text endet nahe am Rand
      ctx.font      = 'bold 13px "DM Sans", sans-serif'
      ctx.fillStyle = m.textColor
      ctx.fillText(m.label, r - 16, 5)   // Label
      ctx.font = '15px serif'
      ctx.fillText(m.emoji, r - 16, -13) // Emoji drüber
      ctx.restore()
    })

    // restore: Koordinatensystem zurücksetzen (ohne Rotation und Translation)
    ctx.restore()

    // ── Hub (Mittelpunkt) ─────────────────────────────────────
    // Weißer/dunkler Kreis in der Mitte überdeckt die Linienenden
    // der Segmente und gibt dem Rad ein sauberes Finish.
    // Wird NACH ctx.restore() gezeichnet → immer ohne Rotation.
    ctx.beginPath()
    ctx.arc(cx, cy, 18, 0, Math.PI * 2)
    ctx.fillStyle   = isDark ? '#0A0A0F' : '#F5F4FA'
    ctx.fill()
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
    ctx.lineWidth   = 1.5
    ctx.stroke()

  }, [isDark])  // ← Neuerstellen wenn Theme wechselt

  // Erstes Zeichnen beim Mounten (und wenn isDark sich ändert)
  useEffect(() => { drawWheel(angleRef.current) }, [drawWheel])

  // ── Segment-Erkennung ─────────────────────────────────────────
  // getSelectedMood(angle): Berechnet welches Segment gerade unter
  // dem fest positionierten Zeiger (12-Uhr-Position) liegt.
  //
  // Grad-basierte Berechnung (klarer als die frühere Radiant-Version):
  //   Schritt 1: Kumulativen Winkel in positive Grad (0–360) umrechnen.
  //              Negatives Vorzeichen weil das Rad gegen den Uhrzeigersinn dreht.
  //              % 360 + 360) % 360 normalisiert auch sehr große/negative Werte.
  //   Schritt 2: Grad durch Segmentgröße (360/N) teilen → Index
  //
  // Diese Variante ist robuster gegen Rundungsfehler bei großen
  // kumulativen Winkeln nach vielen aufeinanderfolgenden Spins.
  const getSelectedMood = (angle) => {
    const angleDeg   = ((-angle * 180 / Math.PI) % 360 + 360) % 360
    const fieldIndex = Math.floor(angleDeg / (360 / N)) % N
    return MOODS[fieldIndex]
  }

  // ── Spin-Funktion ─────────────────────────────────────────────
  // spin(): Startet eine neue Animation wenn das Rad stillsteht.
  const spin = () => {
    if (spinning) return  // Verhindert mehrfache Spins gleichzeitig

    setSpinning(true)
    onResult(null)  // Vorheriges Ergebnis in HomePage zurücksetzen

    // Zufällige Anzahl Umdrehungen: 5–8 volle Runden + Zufallswinkel
    const extraSpins  = (5 + Math.random() * 3) * Math.PI * 2
    // Zieldrehwinkel: aktueller Winkel minus weitere Umdrehungen
    // (negativ weil wir gegen den Uhrzeigersinn drehen)
    const targetAngle = angleRef.current - extraSpins

    // Zufällige Spindauer zwischen 3.2 und 4 Sekunden
    const duration   = 3200 + Math.random() * 800
    const startAngle = angleRef.current
    const startTime  = performance.now()  // Präziser Zeitstempel (ms)

    // ── Animationsschleife ──────────────────────────────────────
    // frame(now): Wird von requestAnimationFrame ~60× pro Sekunde aufgerufen.
    // 't' ist der normalisierte Fortschritt (0 = Anfang, 1 = Ende).
    // Math.min(..., 1) verhindert dass t > 1 wird.
    const frame = (now) => {
      const t = Math.min((now - startTime) / duration, 1)

      // Linearen Fortschritt (t) durch easeOut in natürliche Bewegung umwandeln
      angleRef.current = startAngle + (targetAngle - startAngle) * easeOut(t)
      drawWheel(angleRef.current)

      if (t < 1) {
        // Animation noch nicht fertig → nächsten Frame anfordern
        rafRef.current = requestAnimationFrame(frame)
      } else {
        // Animation abgeschlossen:
        // 1. Winkel exakt auf Zielwert setzen (verhindert Rundungsfehler)
        angleRef.current = targetAngle
        setSpinning(false)
        // 2. Ergebnis berechnen und ans Parent (HomePage) weitergeben
        onResult(getSelectedMood(angleRef.current))
      }
    }

    rafRef.current = requestAnimationFrame(frame)
  }

  // ── Cleanup ───────────────────────────────────────────────────
  // Wenn die Komponente aus dem DOM entfernt wird (z.B. Navigation),
  // muss der laufende requestAnimationFrame-Loop abgebrochen werden.
  // Sonst versucht er weiter zu zeichnen auf ein nicht mehr existierendes Canvas.
  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  // ── JSX ───────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

      {/* Container für Canvas + Zeiger */}
      <div style={{ position: 'relative', width: 340, height: 340 }}>

        {/* Zeiger: Ein CSS-Dreieck per border-Trick.
            position: absolute + transform: translateX(-50%) zentriert ihn
            genau über 12 Uhr des Canvas.
            Er bewegt sich NICHT – das Rad dreht sich unter ihm. */}
        <div style={{
          position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft:  '13px solid transparent',
          borderRight: '13px solid transparent',
          borderTop:   '26px solid #FF2D55',
          filter: 'drop-shadow(0 0 6px rgba(255,45,85,0.5))',
          zIndex: 10,
        }} />

        {/* Das eigentliche Canvas-Element.
            ref={canvasRef} verbindet es mit canvasRef.current.
            width/height müssen als Attribute gesetzt werden – CSS-Größen
            würden das Canvas strecken ohne die Auflösung zu erhöhen! */}
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          style={{ borderRadius: '50%', display: 'block' }}
        />
      </div>

      {/* Spin-Button */}
      <button
        onClick={spin}
        disabled={spinning}
        style={{
          padding: '12px 40px', fontSize: 15, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          // Visuelle Rückmeldung: grauer Button während des Spins
          background: spinning
            ? 'rgba(128,128,128,0.2)'
            : 'linear-gradient(135deg, #FF2D55, #BF5FFF)',
          color:  spinning ? 'rgba(128,128,128,0.6)' : '#fff',
          border: 'none', borderRadius: 100,
          cursor: spinning ? 'not-allowed' : 'pointer',
          transition: 'all .2s',
        }}
      >
        {spinning ? '⏳ Dreht sich...' : '🎰 Drehen'}
      </button>
    </div>
  )
}
