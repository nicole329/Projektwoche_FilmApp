// ─────────────────────────────────────────────────────────────────
// src/services/ai.js  –  Frontend-Proxy für die KI-Funktion
//
// Diese Datei läuft im BROWSER und spricht NUR mit unserer eigenen
// Vercel-Funktion (/api/ai) – niemals direkt mit Anthropic.
//
// Warum der Umweg über /api/ai?
//   API-Keys im Browser sind öffentlich sichtbar (DevTools → Network).
//   Jeder könnte den Key abgreifen und auf unsere Kosten Anfragen stellen.
//   Die Vercel-Funktion hält den Key sicher auf dem Server.
//
// Aufgerufen von: HomePage.jsx → handleResult()
// ─────────────────────────────────────────────────────────────────

// getMoodComment(moodLabel, filmTitles): Ruft unsere serverless Funktion auf
// und gibt den KI-Kommentar als String zurück (oder null bei Fehler).
//
// Parameter:
//   moodLabel  (string) – z.B. "Happy" oder "Melancholisch"
//   filmTitles (array)  – z.B. ["Amelie", "Mamma Mia", ...]
export async function getMoodComment(moodLabel, filmTitles) {
  try {
    // POST an unsere eigene Route /api/ai (relativ – funktioniert in Dev und Prod)
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Nur die Nutzdaten senden – kein API Key!
      // Der Key liegt ausschließlich auf dem Vercel-Server.
      body: JSON.stringify({ moodLabel, filmTitles }),
    })

    const data = await res.json()
    // data.comment enthält den fertigen Text von der Vercel-Funktion.
    // Optional chaining (?.) gibt null zurück wenn comment fehlt,
    // statt einen Fehler zu werfen.
    return data.comment || null

  } catch {
    // Netzwerkfehler (z.B. offline, Vercel-Fehler):
    // Statt die App abstürzen zu lassen, einfach null zurückgeben.
    // HomePage zeigt dann keinen Kommentar an – kein sichtbarer Fehler.
    return null
  }
}
