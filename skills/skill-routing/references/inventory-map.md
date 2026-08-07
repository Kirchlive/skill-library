# Inventory map

Every installed skill, one row each. Generated from the `SKILL.md` frontmatter of all enabled plugins on 2026-08-02: 152 skills across 34 plugins.

**Columns.** `skill` is the invocation name — use `/plugin:skill` when a name appears twice. `family` groups substitutes: pick **one** skill per family per task. `status` is a controlled value:

| status | meaning |
| :--- | :--- |
| `preferred` | default pick inside its family |
| `redundant: X` | X contains it; do not load both |
| `narrow: X` | only for case X, otherwise use the family's preferred skill |
| `needs: X` | requires X; verify before invoking |
| `dead: X` | X is missing on this machine — cannot run |
| `deprecated` | author retired it |
| `router` | selects other skills; never chain two routers |
| `reference` | vocabulary or lookup, no workflow |
| (empty) | no constraint |

**Name caveat.** `/skills` and `/plugin:skill` use the skill's **directory** name; the frontmatter `name:` field sometimes differs. Rows list the directory name, with the frontmatter name in the purpose column where they diverge.

| skill | plugin | family | status | purpose |
| :--- | :--- | :--- | :--- | :--- |
| brainstorming | superpowers | method | | clarify intent before building |
| writing-plans | superpowers | method | narrow: step detail | spec to multi-step plan; redirect output into the wave file |
| master-wave-governance | skill-library | method | preferred | MASTERPLAN/wave lifecycle, task level |
| wayfinder | mattpocock-skills | method | redundant: master-wave-governance | decision tickets on an external tracker; breaks single-SSOT |
| using-git-worktrees | superpowers | method | | isolated workspace |
| verification-before-completion | superpowers | method | | evidence before claiming done |
| test-driven-development | superpowers | method | preferred | test first, see it fail, minimal green |
| tdd | mattpocock-skills | method | redundant: test-driven-development | test-first plus seam negotiation |
| karpathy-guidelines | andrej-karpathy-skills | method | | surgical changes, surface assumptions |
| ponytail | ponytail | method | | laziest thing that works, YAGNI |
| prototype | mattpocock-skills | method | | throwaway prototype for one design question |
| grill-me | mattpocock-skills | method | | interrogate a plan |
| batch-grill-me | mattpocock-skills | method | | same, all questions in one round |
| grill-with-docs | mattpocock-skills | method | | same, emits ADRs and glossary |
| loop-me | mattpocock-skills | method | | interview for workflow specs |
| stress-test | stress-test | method | | verify a plan against real docs and POC code |
| feature-dev | feature-dev | method | | guided feature development |
| systematic-debugging | superpowers | debug | preferred | root cause before fix |
| diagnosing-bugs | mattpocock-skills | debug | narrow: perf regressions, flaky tests | feedback-loop-first diagnosis, bisection and differential |
| code-review | mattpocock-skills | review | needs: docs/agents/issue-tracker.md | two-axis review, standards and spec |
| qa | mattpocock-skills | review | | conversational bug intake to GitHub issues |
| improve-codebase-architecture | mattpocock-skills | architecture | narrow: restructure | deepening scan as HTML report |
| ponytail-audit | ponytail | architecture | narrow: delete | repo-wide over-engineering scan |
| ponytail-debt | ponytail | architecture | | ledger of deliberate shortcuts |
| codebase-design | mattpocock-skills | architecture | reference | deep-module vocabulary |
| design-an-interface | mattpocock-skills | architecture | | parallel API drafts |
| request-refactor-plan | mattpocock-skills | architecture | deprecated | refactor plan as GitHub issue |
| fan-out-subagents | fan-out-subagents | subagents | preferred | subagent type selection before any dispatch |
| dispatching-parallel-agents | superpowers | subagents | redundant: fan-out-subagents | parallelise independent tasks; contradicts fan-out's default |
| subagent-driven-development | superpowers | subagents | preferred: pipeline | sequential execution with ledger and two-stage review |
| claude-handoff | mattpocock-skills | subagents | | hand the session to a background agent |
| council | council | deliberation | preferred | 18-persona deliberation, three rounds |
| llm-council | happycapy-skills | deliberation | dead: gateway key, scripts | multi-model dashboard, stale model IDs |
| adhd | adhd | deliberation | | N branches under different cognitive frames |
| context-mode | context-mode | memory | narrow: this session | route large output through a sandbox |
| ctx-index | context-mode | memory | | index local files into FTS5 |
| ctx-search | context-mode | memory | | query the FTS5 store |
| mem-search | claude-mem | memory | narrow: earlier sessions | cross-session decisions and commits |
| timeline-report | claude-mem | memory | | project history as narrative |
| capy-cortex | happycapy-skills | memory | | hook-driven rule and anti-pattern learning |
| smart-explore | claude-mem | code-understanding | preferred | tree-sitter AST search at symbol level |
| learn-codebase | claude-mem | code-understanding | narrow: small or new repos | read every source file in full |
| deep-research | research-skills | research | preferred | evidence ledger across sources, Python only |
| deer-deep-research | research-skills | research | redundant: deep-research | methodology checklist over host search |
| github-deep-research | research-skills | research | | repo deep dive, token optional |
| en-research | research-skills | research | narrow: multi-entity tables | research outline |
| en-research-deep | research-skills | research | narrow: multi-entity tables | one agent per outline item |
| en-research-report | research-skills | research | narrow: multi-entity tables | consolidate into markdown |
| live-research | research-skills | research | dead: bdata CLI | Bright Data brief with citations |
| tavily-research | research-skills | research | dead: tvly CLI | research via Tavily |
| firecrawl-search | firecrawl | research | dead: firecrawl CLI | search with full page content |
| firecrawl-scrape | firecrawl | research | dead: firecrawl CLI | single URL including SPAs |
| firecrawl-crawl | firecrawl | research | dead: firecrawl CLI | whole site |
| last30days | last30days | research | needs: SCRAPECREATORS_API_KEY | 30 days of social and market chatter; run `--doctor` first |
| consulting-analysis | skill-library | research | | structure findings into a report; does not research |
| context7-mcp | skill-library | research | needs: context7 MCP | current library and framework docs via `resolve-library-id` then `query-docs`; one concept per query |
| browser | skill-library | browser | preferred | drive the real browser via claude-browser MCP |
| opentabs | skill-library | browser | dead: MCP server not configured | same over the OpenTabs MCP |
| frontend-design | frontend-design | design | preferred | visual direction for new UI |
| ui-ux-pro-max | ui-ux-pro-max | design | narrow: dashboards, charts | 84 styles, 192 palettes, 25 chart types |
| web-design-guidelines | skill-library | design | narrow: audit | review UI code against Web Interface Guidelines |
| brutalist-skill | taste-skill | design | narrow: terminal aesthetics | name: industrial-brutalist-ui; only preset with a dark data-dense mode |
| taste-skill | taste-skill | design | redundant: frontend-design | name: design-taste-frontend; excludes dashboards and data tables by its own §13 |
| minimalist-skill | taste-skill | design | redundant: frontend-design | name: minimalist-ui; light mode only |
| redesign-skill | taste-skill | design | redundant: web-design-guidelines | name: redesign-existing-projects; aesthetic audit |
| stitch-skill | taste-skill | design | redundant: taste-skill | name: stitch-design-taste; reexport as Stitch DESIGN.md |
| image-to-code-skill | taste-skill | design | | name: image-to-code; generate design image first, then build |
| imagegen-frontend-web | taste-skill | design | redundant: image-to-code-skill | one image per page section |
| design | ui-ux-pro-max | design | needs: GEMINI_API_KEY | brand, logo, CIP, slides |
| banner-design | ui-ux-pro-max | design | redundant: design | banners for social, ads, print |
| ui-styling | ui-ux-pro-max | design | reference | shadcn, Tailwind, Radix handbook |
| claude-design-to-codebase | claude-design-to-codebase | design | | handoff bundles into framework code plus tokens |
| scroll-world | scroll-world | design | | scroll-scrubbed 3D landing page via Higgsfield |
| hyperframes | hyperframes | video | router | mandatory first read for any video request |
| hyperframes-core | hyperframes | video | | composition contract |
| hyperframes-cli | hyperframes | video | | init, lint, snapshot, render loop |
| hyperframes-animation | hyperframes | video | | motion rules and scene blueprints |
| hyperframes-keyframes | hyperframes | video | | seek-safe GSAP and CSS keyframes |
| hyperframes-creative | hyperframes | video | | design spec handling |
| hyperframes-registry | hyperframes | video | | wire registry blocks into compositions |
| media-use | hyperframes | video | | resolve BGM, SFX, images |
| general-video | hyperframes | video | | fallback when no specialised workflow fits |
| motion-graphics | hyperframes | video | | kinetic typography, stat count-ups |
| music-to-video | hyperframes | video | | track to video |
| product-launch-video | hyperframes | video | | SaaS promo from URL or brief |
| embedded-captions | hyperframes | video | | captions on existing talking-head footage |
| remotion-to-hyperframes | hyperframes | video | narrow: explicit port request | port a Remotion composition |
| film-creator | happycapy-skills | video | | sentence or image to 30-second film |
| ai-video-generation | happycapy-skills | media-gen | needs: inference.sh CLI | Veo, Seedance, Wan and 40+ models |
| ai-image-generation | happycapy-skills | media-gen | needs: inference.sh CLI | FLUX, Gemini, Grok and 50+ models |
| image-enhancer | happycapy-skills | media-gen | | upscale and sharpen screenshots |
| canvas-design | happycapy-skills | media-gen | | visual art as PNG and PDF |
| gbro-collage-broll | happycapy-skills | media-gen | | halftone paper-collage B-roll |
| youtube-music | happycapy-skills | media-gen | | search and play tracks |
| music-generation | skill-library | media-gen | | compose backing tracks and songs |
| podcast-generation | skill-library | media-gen | | text to podcast audio |
| 360-panorama-viewer | happycapy-skills | build-app | | self-contained Three.js panorama viewer |
| 3d-web-experience | happycapy-skills | build-app | | Three.js, R3F, product configurators |
| building-native-ui | happycapy-skills | build-app | | Expo Router apps |
| next-best-practices | happycapy-skills | build-app | | Next.js conventions and RSC boundaries |
| claude-code-templates | happycapy-skills | build-app | | 600+ agent and command templates |
| contract-first-agents | happycapy-skills | build-app | | map-reduce protocol for TeamCreate teams |
| oss-contributor-swarm | happycapy-skills | build-app | | 9-agent swarm for OSS contributions |
| cmux-skill | cmux-ai-agents-bundle | build-app | narrow: macOS | name: cmux; drive the cmux terminal app |
| writing-skills | superpowers | skills-authoring | preferred | author and verify skills, baseline-test driven |
| skill-development | plugin-dev | skills-authoring | redundant: writing-skills | editorial guidance for skills inside a plugin |
| skill-creator-build | happycapy-skills | skills-authoring | redundant: writing-skills | script-driven scaffold and `.skill` packaging |
| skill-creator-adapt | happycapy-skills | skills-authoring | needs: OPENROUTER_API_KEY | clone and adapt a published skill; carries stubs |
| writing-great-skills | mattpocock-skills | skills-authoring | reference | skill-authoring vocabulary and failure modes |
| skill-reviewer | skill-library | skills-authoring | | read-only audit gate, blocked/revise/publish |
| skill-routing | skill-library | skills-authoring | router | selects skills for a task |
| find-skills | happycapy-skills | skills-authoring | router | searches the public ecosystem, not this install |
| ask-matt | mattpocock-skills | skills-authoring | router | picks a mattpocock flow |
| plugin-structure | plugin-dev | plugin-authoring | | directory layout and manifest |
| hook-development | plugin-dev | plugin-authoring | | hook events and prompt-based hooks |
| plugin-settings | plugin-dev | plugin-authoring | | per-project plugin configuration |
| code-documentation | skill-library | docs | narrow: repo docs | README, API reference, architecture |
| good-docs-writer | skill-library | docs | narrow: single post | blog, tutorial or concept article |
| latex-document | happycapy-skills | docs | | LaTeX to PDF with PNG preview |
| frontend-slides | happycapy-skills | docs | | animated HTML presentations |
| html-over-markdown | happycapy-skills | docs | | rich self-contained HTML documents |
| treatment-plans | happycapy-skills | docs | narrow: clinical | medical treatment plans as PDF |
| obsidian-vault | mattpocock-skills | docs | | notes with wikilinks |
| writing-clearly-and-concisely | happycapy-skills | writing | preferred | prose humans read: docs, commits, errors |
| edit-article | mattpocock-skills | writing | | revise and tighten a draft |
| writing-fragments | mattpocock-skills | writing | | mine raw fragments, no structure yet |
| writing-shape | mattpocock-skills | writing | | shape fragments into an article |
| writing-beats | mattpocock-skills | writing | | assemble material into beats |
| teach | mattpocock-skills | writing | | explain a topic |
| newsletter-generation | skill-library | writing | | newsletter or email digest |
| resume-assistant | happycapy-skills | writing | | five-agent job-search flow |
| happycapy-social-publisher | happycapy-skills | social | | publish to 13+ platforms |
| reddit-post-writer | happycapy-skills | social | | emotion-first Reddit posts |
| chart-visualization | skill-library | data | | pick and render the right chart |
| data-analysis | skill-library | data | | Excel and CSV analysis |
| data-storytelling | happycapy-skills | data | | turn data into a narrative |
| topic-bookmarks-reorganizer | skill-library | data | | dedupe and regroup a bookmarks export |
| board | bounty-board | telemetry | | TODO and FIXME as ageing XP bounties |
| leaderboard | context-hogs | telemetry | | files that pulled the most tokens |
| scorecard | dead-rules-audit | telemetry | | which CLAUDE.md rules are actually followed |
| dead-ends | dead-end-registry | telemetry | | abandoned approaches with reasons and cost |
| receipts | nerf-receipts | telemetry | | usage and impact from local transcripts |
| provenance | pr-provenance-stamp | telemetry | | provenance receipt for the session |
| standup | standup-autopilot | telemetry | | read-only standup across worktrees and PRs |
| caveman | caveman | mode | | output-style intensity |
| think-in-config-language | skill-library | mode | | think in the configured language |
| prompt-improver | prompt-improver | mode | narrow: hook-driven | reached via `*` prefix, not by invocation |
| prompt-improver | happycapy-skills | mode | redundant: prompt-improver | duplicate install |
| surprise-me | skill-library | misc | | combine skills for an unexpected demo |
| wizard | mattpocock-skills | misc | | interactive bash wizard for manual procedures |
| voicemode-dj | voicemode | misc | | background music for voice sessions |
| converse | voicemode | misc | | ongoing voice conversation |

## Deactivated

Removed from the active set on 2026-08-02, kept in `cache/happycapy-skills/happycapy-skills/1.0.0/skills_/`; move the directory back to `skills/` to restore.

| skill | reason |
| :--- | :--- |
| redbook-creator-publish | Xiaohongshu-bound, 34 hard platform references; Instagram and Threads already covered by `happycapy-social-publisher` |
| xiaohongshu-recruiter | Playwright wired to `creator.xiaohongshu.com` with Chinese DOM matching; retargeting is a rewrite, not a swap |

Disabled at plugin level in `settings.json`: `drawio`, `understand-anything`, `claude-model-router-hook`.
