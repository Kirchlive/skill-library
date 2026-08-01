// Markdown-Metriken für Dokumentreviews.
// Reine Analysefunktionen — die CLI-Schicht liegt am Dateiende.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const RE_SOURCE_ID = /\b([A-Z]\d{2})\b/g;
const RE_URL = /https?:\/\/[^\s|)\]]+/g;
const RE_ISO_DATE = /\b20\d{2}-\d{2}-\d{2}\b/g;
const RE_STAND = /\b(Stand|abgerufen|Abruf)\b/gi;

/** Index der Zeile, ab der das Quellenregister beginnt (-1 wenn keins existiert). */
const findRegisterStart = lines => lines.findIndex(l =>
  /^#{1,3} .*(Quellenregister|Quellen|Sources|Bibliograph)/i.test(l)
);

/**
 * Analysiert ein Markdown-Dokument.
 * Quellen gelten als "tot", wenn sie im Register stehen, aber im Text davor
 * nie referenziert werden.
 */
export function analyze(text) {
  const lines = text.split('\n');
  const regAt = findRegisterStart(lines);
  const body = regAt === -1 ? text : lines.slice(0, regAt).join('\n');
  const register = regAt === -1 ? '' : lines.slice(regAt).join('\n');

  const registered = [...new Set(register.match(RE_SOURCE_ID) || [])];
  const referencedAll = new Set(body.match(RE_SOURCE_ID) || []);
  const referenced = registered.filter(id => referencedAll.has(id));
  const dead = registered.filter(id => !referencedAll.has(id));

  const urls = text.match(RE_URL) || [];
  const hosts = {};
  for (const u of urls) {
    try {
      const h = new URL(u).hostname.replace(/^www\./, '');
      hosts[h] = (hosts[h] || 0) + 1;
    } catch {
      // unparsbare URL überspringen
    }
  }

  const countHeadings = level =>
    lines.filter(l => new RegExp(`^#{${level}} `).test(l)).length;

  return {
    chars: text.length,
    lines: lines.length,
    words: text.split(/\s+/).filter(Boolean).length,
    headings: { h1: countHeadings(1), h2: countHeadings(2), h3: countHeadings(3) },
    tableRows: lines.filter(l => /^\s*\|.*\|/.test(l)).length,
    codeBlocks: (text.match(/^```/gm) || []).length / 2,
    urls: { total: urls.length, unique: new Set(urls).size, hosts },
    sources: {
      registered,
      referenced,
      dead,
      referencesInBody: (body.match(RE_SOURCE_ID) || []).length,
    },
    freshness: {
      isoDates: (text.match(RE_ISO_DATE) || []).length,
      standMarkers: (text.match(RE_STAND) || []).length,
    },
  };
}

/** Zählt Begriffe wortgenau und case-insensitiv. Mehrwort-Begriffe sind erlaubt. */
export function countTerms(text, terms) {
  const out = {};
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out[term] = (text.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || []).length;
  }
  return out;
}

/** Vergleicht zwei Analysen. deadBoth sind Quellen, die in beiden Dokumenten tot sind. */
export function compare(a, b) {
  const num = (x, y) => ({ a: x, b: y, delta: y - x });
  const setB = new Set(b.sources.dead);
  return {
    chars: num(a.chars, b.chars),
    words: num(a.words, b.words),
    tableRows: num(a.tableRows, b.tableRows),
    sources: {
      registeredA: a.sources.registered.length,
      registeredB: b.sources.registered.length,
      referencesA: a.sources.referencesInBody,
      referencesB: b.sources.referencesInBody,
      deadA: a.sources.dead,
      deadB: b.sources.dead,
      deadBoth: a.sources.dead.filter(id => setB.has(id)),
    },
    freshness: {
      isoDates: num(a.freshness.isoDates, b.freshness.isoDates),
      standMarkers: num(a.freshness.standMarkers, b.freshness.standMarkers),
    },
  };
}

// --- CLI ---------------------------------------------------------------
// Nur bei Direktaufruf aktiv, damit Importe im Test nichts ausführen.

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const args = process.argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  const flag = name => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? null : args[i + 1];
  };

  if (!file) {
    console.error('Aufruf: node doc-metrics.mjs <datei> [--compare <datei2>] [--terms a,b,c]');
    process.exit(1);
  }

  const terms = (flag('terms') || '').split(',').map(s => s.trim()).filter(Boolean);
  const textA = readFileSync(file, 'utf8');
  const a = analyze(textA);
  const other = flag('compare');

  const line = (label, value) => console.log(`  ${label.padEnd(24)} ${value}`);

  if (!other) {
    console.log(`=== ${file} ===`);
    line('Zeichen', a.chars);
    line('Zeilen', a.lines);
    line('Wörter', a.words);
    line('H1/H2/H3', `${a.headings.h1} / ${a.headings.h2} / ${a.headings.h3}`);
    line('Tabellenzeilen', a.tableRows);
    line('Codeblöcke', a.codeBlocks);
    line('URLs (eindeutig)', `${a.urls.total} (${a.urls.unique})`);
    line('Quellen registriert', a.sources.registered.length);
    line('Referenzen im Text', a.sources.referencesInBody);
    line('TOTE Quellen', `${a.sources.dead.length} ${a.sources.dead.join(', ')}`);
    line('ISO-Daten', a.freshness.isoDates);
    line('Stand-Marker', a.freshness.standMarkers);
    if (terms.length) {
      console.log('  --- Begriffe ---');
      const counts = countTerms(textA, terms);
      for (const [t, n] of Object.entries(counts)) line(`  ${t}`, n);
    }
  } else {
    const textB = readFileSync(other, 'utf8');
    const b = analyze(textB);
    const d = compare(a, b);
    console.log(`=== A: ${file}\n=== B: ${other}`);
    const row = (label, x, y) =>
      console.log(`  ${label.padEnd(24)} ${String(x).padStart(8)} ${String(y).padStart(8)}`);
    row('', 'A', 'B');
    row('Zeichen', d.chars.a, d.chars.b);
    row('Wörter', d.words.a, d.words.b);
    row('Tabellenzeilen', d.tableRows.a, d.tableRows.b);
    row('Quellen registriert', d.sources.registeredA, d.sources.registeredB);
    row('Referenzen im Text', d.sources.referencesA, d.sources.referencesB);
    row('tote Quellen', d.sources.deadA.length, d.sources.deadB.length);
    row('ISO-Daten', d.freshness.isoDates.a, d.freshness.isoDates.b);
    row('Stand-Marker', d.freshness.standMarkers.a, d.freshness.standMarkers.b);
    if (d.sources.deadBoth.length) {
      console.log(`  in BEIDEN tot: ${d.sources.deadBoth.join(', ')}`);
    }
    if (terms.length) {
      console.log('  --- Begriffe (A / B) ---');
      const ca = countTerms(textA, terms);
      const cb = countTerms(textB, terms);
      for (const t of terms) row(`  ${t}`, ca[t], cb[t]);
    }
  }
}
