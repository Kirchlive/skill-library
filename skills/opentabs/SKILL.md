---
name: opentabs
description: >
  Den Browser des Nutzers über die OpenTabs-MCP-Tools steuern — Tabs lesen, Formulare
  bedienen, Downloads auslösen, Seiten auswerten. Nutze diesen Skill VOR dem ersten
  browser_*-Aufruf: er entscheidet, ob ein Domain-Plugin (claude, github, youtube) die
  Aufgabe billiger löst, und fängt drei Fallen ab, die stumm falsche Ergebnisse liefern.
---

# OpenTabs

Regeln für die Arbeit mit den OpenTabs-MCP-Tools. Alle Messwerte stammen aus einem
Audit-Log mit 37 Aufrufen (26.07.2026).

## Regel 1 — Plugin vor Browser-Tool

**Vor jedem `browser_*`-Aufruf prüfen, ob ein Plugin die Domain abdeckt.**

`plugin_list_tabs` kostet 0 ms und zeigt Plugin plus Bereitschaftsstatus.

| Domain | Plugin statt DOM-Arbeit | gemessene Ersparnis |
|---|---|---|
| claude.ai | `claude__send_message`, `claude__get_conversation` | 8 Schritte → 1 |
| youtube.com | `youtube__*` (18 Tools) | 3 → 1; bei Kommentaren/History erst dadurch praktikabel |
| github.com | `github__*` (35 Tools) | ersetzt DOM-Arbeit vollständig |

Eine Nachricht in einen Claude-Chat zu schreiben braucht per DOM acht Schritte
(Tab suchen, Liste auslagern, filtern, tippen, verifizieren, Enter, warten,
Screenshot prüfen). `claude__send_message(conversation_uuid, message)` braucht einen.
Die `conversation_uuid` steht in der Chat-URL.

**Achtung Plugin-Status:** Ein Plugin kann `closed` sein (kein passender Tab offen).
Seine Tools erscheinen trotzdem in der Tool-Liste und schlagen beim Aufruf fehl.
`opentabs plugin list` oder `plugin_list_tabs` zeigt den Status.

## Regel 2 — Vor jedem Klick scrollen

`browser_click_element` meldet `clicked: true`, **auch wenn das Element außerhalb des
Viewports liegt und kein Klick wirksam wird.** Das Audit-Log protokolliert diesen Fall
als Erfolg — die Fehlerklasse ist im Monitoring unsichtbar.

Immer zuerst:

```
browser_scroll(tabId, selector)     # 5 ms
browser_click_element(tabId, selector)
```

Danach die Wirkung prüfen, nicht die Rückmeldung glauben. Bei Downloads:
`browser_list_downloads`, nicht das Dateisystem.

Entfällt, sobald `browser_click_element` selbst scrollt oder `clicked: false` meldet.

## Regel 3 — Screenshot vor Selektor-Raten

Bei unbekannten Seiten zuerst `browser_screenshot_tab` mit `filePath` (schreibt die PNG
auf Platte, statt Base64 in den Kontext zu kippen), dann gezielt abfragen.

Gemessen: Mit Screenshot zuerst waren drei Rateschritte überflüssig. Ohne kostete das
Raten bei einer SPA fünf Zusatzschritte.

## Regel 4 — Listen nie ungefiltert in den Kontext

`browser_list_tabs` hat keinen Filter-Parameter. Bei 134 offenen Tabs kamen 63 002
Zeichen zurück und sprengten das Token-Limit.

Vorgehen: Aufruf absetzen, die ausgelagerte Datei im Sandbox filtern, nur den Treffer
in den Kontext holen. Gleiches gilt für `youtube__search_videos`,
`youtube__get_video_comments`, `youtube__get_watch_history` — alle ohne `limit`.

Entfällt, sobald `browser_list_tabs` einen `query`-Parameter hat.

## Regel 5 — Bei SPAs nie `selector: body`

`browser_get_tab_content` mit dem Default `body` liefert bei Single-Page-Apps die
Navigation statt des Inhalts. Bei claude.ai kam die komplette Chat-Sidebar zurück und
kein Wort vom eigentlichen Artefakt.

Stattdessen erst die Struktur über `browser_query_elements` mit Überschriften-Selektoren
erkunden (6 ms Median), dann gezielt lesen.

## Was gut funktioniert

- `browser_screenshot_tab` mit `filePath` — Bytes landen auf Platte, nur `{savedTo, bytes}` im Kontext
- `browser_download_file` + `browser_get_download_status` — verlässliche IDs und States
- `browser_query_elements` mit `attributes`-Whitelist — ohne sie fluten Framework-Klassenketten
  (bis 400 Zeichen pro Element) die Antwort
- Latenz ist selten das Problem: Median 52 ms über alle Aufrufe. Teuer sind Roundtrips
  und Tokens, nicht Wartezeit. Ausnahmen: `browser_press_key` (2 748 ms),
  `browser_click_element` (2 400 ms)

## Sicherheit

`browser_list_tabs` liefert **alle** offenen Tabs, auch sensible. Nicht an Plugin-Tools
weiterreichen, nicht ungefiltert protokollieren.

Schreibende Plugin-Tools (`like_video`, `subscribe`, `create_comment`, `delete_*`,
`merge_pull_request`) verändern echte Konten. Nur auf ausdrückliche Aufforderung
und nach Rückfrage.

## Scripts

Deterministische Auswertung gehört ins Script, nicht in handgeschriebenen Wegwerf-Code.

### `scripts/doc-metrics.mjs`

Markdown-Dokumente vermessen: Umfang, Struktur, Quellenlage, Frische-Marker,
Begriffshäufigkeit. Ersetzt die Zählarbeit bei Dokumentreviews.

```bash
# Einzelauswertung
node ~/.claude/skills/opentabs/scripts/doc-metrics.mjs <datei>

# Zwei Fassungen vergleichen, mit Begriffszählung
node ~/.claude/skills/opentabs/scripts/doc-metrics.mjs <datei-a> \
  --compare <datei-b> --terms "Zod,TanStack Query,Vitest"
```

Meldet unter anderem **tote Quellen** — IDs, die im Quellenregister stehen, im Text
davor aber nie referenziert werden. Im Vergleichsmodus zusätzlich, welche davon in
**beiden** Fassungen tot sind; das trennt geerbte Altlasten von neuen Fehlern.

Tests: `node --test ~/.claude/skills/opentabs/scripts/doc-metrics.test.mjs`
