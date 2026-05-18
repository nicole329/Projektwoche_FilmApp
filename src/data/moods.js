// ─────────────────────────────────────────────────────────────────
// src/data/moods.js  –  Zentrale Datendatei für alle Stimmungen
//
// Diese Datei ist die einzige "Wahrheitsquelle" (Single Source of Truth)
// für Stimmungen und Filmvorschläge. Wenn du einen Film hinzufügen,
// entfernen oder eine Farbe ändern willst – hier ist der richtige Ort.
//
// Das Array MOODS wird importiert von:
//   • RouletteWheel.jsx  → zum Zeichnen der Segmente auf dem Canvas
//   • HomePage.jsx       → zum Anzeigen der Ergebnisse nach dem Drehen
// ─────────────────────────────────────────────────────────────────

// 'export const' macht das Array für alle anderen Dateien verfügbar,
// die 'import { MOODS } from ...' schreiben.
export const MOODS = [
  {
    // label: Der angezeigte Name im Rad und in der Ergebniskarte.
    // Wird auch als Parameter an die Claude KI weitergegeben.
    label: 'Happy',

    // color: Hintergrundfarbe des Segments im Canvas-Rad.
    // Wird auch als Akzentfarbe in der ResultCard und FilmCard verwendet.
    // Tipp: Pastelltöne funktionieren gut, weil der Text gut lesbar bleibt.
    color: '#F0C27F',

    // textColor: Schriftfarbe für Label und Emoji im Canvas-Segment.
    // Muss ausreichend Kontrast zu 'color' haben!
    textColor: '#633806',

    // emoji: Wird im Canvas neben dem Label gezeichnet (ctx.fillText).
    // Außerdem in der Ergebniskarte als visueller Akzent genutzt.
    emoji: '😄',

    // desc: Kurzbeschreibung der Stimmung – erscheint unter dem Chip
    // in der Ergebniskarte auf der HomePage.
    desc: 'Leichte, fröhliche Filme die gute Laune machen.',

    // films: Array mit Filmvorschlägen für diese Stimmung.
    // 'name' wird an OMDB API gesendet (Suche nach Titel).
    // 'desc' ist ein kurzer Untertitel der lokal angezeigt wird,
    // BEVOR die echten OMDB-Daten (Poster, Rating, etc.) geladen sind.
    films: [
      { name: 'The Grand Budapest Hotel', desc: 'Skurrile Komödie voller Witz' },
      { name: 'Mamma Mia',                desc: 'ABBA, Sonne und pure Freude' },
      { name: 'Amelie',                   desc: 'Zauberhaftes Pariser Märchen' },
      { name: 'Paddington',               desc: 'Warmherziger Bär in London' },
    ],
  },
  {
    label: 'Melancholisch',
    color: '#9BB5C7',
    textColor: '#0C447C',
    emoji: '🌧️',
    desc: 'Nachdenkliche Filme die tief unter die Haut gehen.',
    films: [
      { name: 'Eternal Sunshine of the Spotless Mind', desc: 'Vergessen als Schmerz und Rettung' },
      { name: 'Her',                    desc: 'Einsamkeit in naher Zukunft' },
      { name: 'Lost in Translation',    desc: 'Zwei Fremde, eine Nacht in Tokio' },
      { name: 'Manchester by the Sea',  desc: 'Trauer die keine Auflösung kennt' },
    ],
  },
  {
    label: 'Abenteuerlich',
    color: '#8BC99A',
    textColor: '#27500A',
    emoji: '🗺️',
    desc: 'Epische Reisen und Entdeckungen warten.',
    films: [
      { name: 'Indiana Jones Raiders of the Lost Ark', desc: 'Abenteuer in alten Ruinen' },
      { name: 'The Revenant',    desc: 'Überleben in wilder Natur' },
      { name: 'Interstellar',    desc: 'Reise ans Ende des Universums' },
      { name: 'Jurassic Park',   desc: 'Dinosaurier und Nervenkitzel' },
    ],
  },
  {
    label: 'Romantisch',
    color: '#F4A7B9',
    textColor: '#4B1528',
    emoji: '💕',
    desc: 'Herzklopfen, Sehnsucht und große Gefühle.',
    films: [
      { name: 'Notting Hill',        desc: 'Buchladenbesitzer trifft Filmstar' },
      { name: 'La La Land',          desc: 'Träume und Liebe in Hollywood' },
      { name: 'Pride and Prejudice', desc: 'Klassische Romanze mit Witz' },
      { name: 'The Notebook',        desc: 'Liebe die Jahrzehnte überdauert' },
    ],
  },
  {
    label: 'Gruselig',
    color: '#B89FCC',
    textColor: '#3C3489',
    emoji: '👻',
    desc: 'Schauer, Spannung und dunkle Geheimnisse.',
    films: [
      { name: 'Get Out',      desc: 'Horror mit gesellschaftlichem Tiefgang' },
      { name: 'Hereditary',   desc: 'Familiendrama trifft Albtraum' },
      { name: 'The Shining',  desc: 'Kubrick am Gipfel des Schreckens' },
      { name: 'A Quiet Place', desc: 'Stille ist die einzige Rettung' },
    ],
  },
  {
    label: 'Action',
    color: '#E8896A',
    textColor: '#711B13',
    emoji: '💥',
    desc: 'Tempo, Explosionen und Adrenalin pur.',
    films: [
      { name: 'Mad Max Fury Road',    desc: 'Nonstop-Chaos in der Wüste' },
      { name: 'John Wick',            desc: 'Unnachgiebige Ein-Mann-Armee' },
      { name: 'Mission Impossible',   desc: 'Unmögliche Missionen seit 1996' },
      { name: 'Die Hard',             desc: 'Weihnachten im Hochhaus' },
    ],
  },
]

// ─── Warum als Konstante (const) statt als Variable (let)? ────────
// Das Array soll niemals ersetzt werden – nur seine Inhalte werden
// gelesen. 'const' kommuniziert diese Absicht klar an andere Entwickler.
// ─────────────────────────────────────────────────────────────────
