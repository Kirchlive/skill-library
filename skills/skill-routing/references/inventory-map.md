# Inventory map

This install carries roughly 290 skills across 17 namespaces. A flat scan of that listing is unreliable: match the task to a **family** first, then pick one skill inside it.

## Families

| The task is about | Look in |
| :--- | :--- |
| Method: how to approach the work at all | `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `verification-before-completion` (superpowers) · `grilling`, `to-spec`, `to-tickets`, `implement`, `wayfinder`, `handoff`, `prototype` (mattpocock-skills) |
| Multi-file change, wave/plan governance | `master-wave-governance` — takes precedence over generic planning skills in repos that use it |
| Over-engineering, cutting scope | `ponytail`, `ponytail-review`, `ponytail-audit`, `simplify` |
| External research, citations, verification | `deep-research`, `deer-deep-research`, `live-research`, `tavily-research`, `en-research*` (research-skills) · `github-deep-research` for a repo · `firecrawl-*` for scraping a known site |
| Understanding an existing codebase | `understand-*` (knowledge graph) · `learn-codebase`, `pathfinder`, `smart-explore` (claude-mem) · `ctx-*` / `context-mode` when output volume is the problem |
| Debugging a specific failure | `systematic-debugging`, `diagnosing-bugs`, `understand-diff` |
| Review | `code-review` (bundled), `code-review (mattpocock-skills)`, `receiving-code-review`, `requesting-code-review`, `security-review`, `react-best-practices (vercel)` |
| Frontend look and feel | `frontend-design` · `taste-skill` family (`high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `redesign-existing-projects`) · `ui-ux-pro-max` family (`design-system`, `ui-styling`, `brand`) · `web-design-guidelines` to audit |
| Next.js, deploys, platform work | `vercel` namespace (26 skills) — `nextjs`, `deploy`, `env-vars`, `turbopack`, `vercel-functions`, and so on |
| Video, animation, motion | `hyperframes` first — it declares itself the mandatory first read for any video or animation request — then the specific one (`general-video`, `slideshow`, `motion-graphics`, `music-to-video`, `pr-to-video`) |
| Charts and data | `chart-visualization`, `dataviz`, `data-analysis`, `data-storytelling` |
| Documents and decks | `pptx`, `pdf`, `latex-document`, `canvas-design`, `frontend-slides`, `html-over-markdown`, `code-documentation` |
| Writing and publishing | `writing-clearly-and-concisely`, `newsletter-generation`, `good-docs-writer`, `happycapy-social-publisher`, `reddit-post-writer` |
| Building skills, plugins, agents | `skill-creator`, `writing-skills`, `writing-great-skills`, `skill-development`, `skill-reviewer`, `find-skills` · `plugin-structure`, `create-plugin`, `hook-development`, `command-development`, `mcp-integration`, `agent-development` |
| Claude Code setup and operation | `doctor`, `update-config`, `fewer-permission-prompts`, `statusline`, `debug`, `schedule`, `loop`, `team-onboarding` |
| Output tone or working mode | `caveman*`, `ponytail`, `think-in-config-language`, `full-output-enforcement`, `adhd`, `council` |

## One family, one skill

Several families hold near-substitutes — eight research skills, three review skills, six design families. Loading two members of the same family gives Claude two competing methods for one job and doubles the permanent context cost. Pick one, name it, move on. Reach for a second only after the first has visibly failed at the task.

## Name collisions

Five names resolve to more than one skill. Say which one you mean by using the qualified form `/plugin:skill`:

| Name | Variants | Default choice |
| :--- | :--- | :--- |
| `code-review` | bundled · `mattpocock-skills` | mattpocock's when the repo follows its spec/ticket flow, otherwise the bundled one |
| `deep-research` | standalone · `research-skills` | the standalone one for evidence-ledgered work with source-quality checks |
| `prompt-improver` | `happycapy-skills` · `prompt-improver` | either; state which |
| `converse` | `voicemode-mcp` · `voicemode` | whichever the active voice setup uses |
| `reddit-post-writer` | listed twice under `happycapy-skills` | a duplicate install worth cleaning up |

## Other routers in this install

`using-superpowers`, `ask-matt (mattpocock-skills)`, and `find-skills` each decide which skill to use. Do not chain them.

- `using-superpowers` — a session-start bootstrap, not a selection procedure. If its session hook is active, let it point here and do the selection with this skill.
- `ask-matt` — scoped to the mattpocock engineering flows. Delegate to it once the task is clearly inside that family.
- `find-skills` — searches the **public ecosystem** for skills not installed yet. That is an install decision, not a routing decision. Use it only when the user asks, and never mid-task.
