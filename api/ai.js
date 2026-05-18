// ─────────────────────────────────────────────────────────────────
// api/ai.js  –  Vercel Serverless Function (läuft auf dem SERVER)
//
// ⚠️ Diese Datei wird NICHT im Browser ausgeführt!
// Vercel erkennt alle Dateien im /api-Ordner als serverlose Funktionen
// und führt sie auf eigenen Servern aus.
//
// Zweck: Der Anthropic API Key darf niemals den Server verlassen.
// Diese Funktion bildet einen sicheren Tunnel:
//   Browser → /api/ai (unser Server) → api.anthropic.com
//
// Endpunkt: POST /api/ai
// Body:     { moodLabel: string, filmTitles: string[] }
// Antwort:  { comment: string } oder { error: string }
// ─────────────────────────────────────────────────────────────────

// 'export default function handler' ist das Vercel-Muster für serverlose Funktionen.
// req = eingehende Anfrage, res = Antwortobjekt
export default async function handler(req, res) {

  // Nur POST erlauben – GET-Anfragen (z.B. direkter Browser-Aufruf) ablehnen.
  // 405 = "Method Not Allowed"
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // process.env liest Umgebungsvariablen aus den Vercel-Dashboard-Einstellungen.
  // Diese existieren NUR auf dem Server – im Browser ist process.env undefined.
  // Vorteil: Key ist weder im Source Code noch im Browser sichtbar.
  const apiKey = process.env.ANTHROPIC_API_KEY

  // Früher Fehler wenn der Key nicht konfiguriert ist (z.B. neues Deployment).
  // 500 = "Internal Server Error" – passender als 401 weil es ein Konfig-Problem ist.
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' })
  }

  // req.body enthält den geparsten JSON-Body der POST-Anfrage.
  // Destructuring: beide Werte direkt aus dem Objekt herauslesen.
  const { moodLabel, filmTitles } = req.body

  // Eingaben validieren: Beide Felder sind Pflicht für den KI-Prompt.
  // 400 = "Bad Request" – der Aufrufer hat etwas falsch gemacht.
  if (!moodLabel || !filmTitles) {
    return res.status(400).json({ error: 'moodLabel and filmTitles are required' })
  }

  try {
    // ── Anfrage an Anthropic API ────────────────────────────────
    // Der API Key steht im 'x-api-key' Header.
    // Dieser Header ist NUR zwischen unserem Server und Anthropic sichtbar –
    // nie im Browser (dort sieht man nur die Anfrage an /api/ai, ohne Key).
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       apiKey,
        'anthropic-version': '2023-06-01',  // API-Version – bei Breaking Changes hier anpassen
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 120,  // Kurze Antwort: 2 Sätze ≈ 60–80 Wörter
        messages: [{
          role: 'user',
          content: `Du bist ein witziger Filmkritiker. Stimmung: "${moodLabel}". Filme: ${filmTitles.join(', ')}. Schreib 2 unterhaltsame Sätze (max 60 Wörter) warum diese Filme perfekt für diese Stimmung passen. Sei locker.`,
        }],
      }),
    })

    const data = await response.json()

    // data.content ist ein Array von Blöcken – wir wollen nur den Textinhalt.
    // Optional chaining (?.) gibt undefined zurück wenn content leer ist,
    // || null wandelt das in null um (klarer als undefined).
    const comment = data.content?.[0]?.text || null

    // Nur den fertigen Text zurückschicken – keine API-Interna wie
    // model, usage, stop_reason usw.
    return res.status(200).json({ comment })

  } catch (error) {
    // Netzwerkfehler oder unerwartete Antwort von Anthropic.
    // console.error schreibt ins Vercel-Log (nicht im Browser sichtbar).
    console.error('Anthropic API error:', error)
    return res.status(500).json({ error: 'Failed to fetch AI comment' })
  }
}
