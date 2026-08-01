import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, countTerms } from './doc-metrics.mjs';

const SAMPLE = `# Titel

Ein Satz mit einer Referenz [P01] und noch einer [P02].

## Abschnitt

| Spalte | Wert |
|---|---|
| a | 1 |

\`\`\`js
const x = 1;
\`\`\`

Stand: 2026-07-26

### Unterabschnitt

Noch ein Verweis auf [P01].

# 9. Quellenregister

| ID | Quelle | URL |
|---|---|---|
| **P01** | Erste | https://example.com/a |
| **P02** | Zweite | https://example.org/b |
| **P03** | Dritte, nie zitiert | https://example.com/c |
`;

test('zählt Umfang und Struktur', () => {
  const m = analyze(SAMPLE);
  assert.equal(m.headings.h1, 2);
  assert.equal(m.headings.h2, 1);
  assert.equal(m.headings.h3, 1);
  assert.equal(m.codeBlocks, 1);
  assert.ok(m.chars > 0);
  assert.ok(m.words > 0);
});

test('erkennt Tabellenzeilen', () => {
  const m = analyze(SAMPLE);
  assert.equal(m.tableRows, 8);
});

test('findet tote Quellen', () => {
  const m = analyze(SAMPLE);
  assert.deepEqual(m.sources.registered.sort(), ['P01', 'P02', 'P03']);
  assert.deepEqual(m.sources.referenced.sort(), ['P01', 'P02']);
  assert.deepEqual(m.sources.dead, ['P03']);
});

test('zählt URLs und Hosts', () => {
  const m = analyze(SAMPLE);
  assert.equal(m.urls.total, 3);
  assert.equal(m.urls.unique, 3);
  assert.equal(m.urls.hosts['example.com'], 2);
});

test('erkennt Frische-Marker', () => {
  const m = analyze(SAMPLE);
  assert.equal(m.freshness.isoDates, 1);
  assert.equal(m.freshness.standMarkers, 1);
});

test('kommt ohne Quellenregister zurecht', () => {
  const m = analyze('# Nur ein Titel\n\nText ohne alles.\n');
  assert.deepEqual(m.sources.registered, []);
  assert.deepEqual(m.sources.dead, []);
});

test('countTerms zählt wortgenau und case-insensitiv', () => {
  const t = 'Zod und zod, aber nicht Zodiac. Prisma.';
  const r = countTerms(t, ['Zod', 'Prisma', 'Drizzle']);
  assert.equal(r.Zod, 2);
  assert.equal(r.Prisma, 1);
  assert.equal(r.Drizzle, 0);
});

test('countTerms behandelt Mehrwort-Begriffe', () => {
  const r = countTerms('TanStack Query ist da. TanStack Query erneut.', ['TanStack Query']);
  assert.equal(r['TanStack Query'], 2);
});

import { compare } from './doc-metrics.mjs';

test('compare zeigt Differenzen und gemeinsame tote Quellen', () => {
  const a = analyze('# A\n\n[P01]\n\n# Quellen\n\n| **P01** | x |\n| **P02** | y |\n');
  const b = analyze('# B\n\n[P01] [P02]\n\n# Quellen\n\n| **P01** | x |\n| **P02** | y |\n');
  const d = compare(a, b);
  assert.equal(d.sources.deadA.length, 1);
  assert.equal(d.sources.deadB.length, 0);
  assert.deepEqual(d.sources.deadBoth, []);
  assert.equal(typeof d.chars.delta, 'number');
});

test('compare erkennt identische tote Quellen in beiden Dokumenten', () => {
  const doc = '# T\n\n[P01]\n\n# Quellen\n\n| **P01** | x |\n| **P09** | tot |\n';
  const d = compare(analyze(doc), analyze(doc));
  assert.deepEqual(d.sources.deadBoth, ['P09']);
});
