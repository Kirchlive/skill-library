---
name: skill-routing
description: Decides which of the installed skills a task needs and loads them before the work starts. This skill should be used at the beginning of any multi-step task — build, fix, refactor, migrate, review, plan, release, research, write, design, video — and again at every phase change, after context compaction, and when work moves into a different part of the codebase. Use it for requests like "let's build X", "fix this bug", "refactor Y", "plan the migration", "review this", and also when the user asks which skill applies, why a skill did not fire, or asks to check what is available.
---

# Skill Routing

Every installed skill's name and description is already in context — the harness loads that listing at session start and loads a skill's body only when it is invoked. Routing is therefore a **decision**, not a search.

This install carries roughly 290 skills across 17 namespaces. At that size two things change: a flat scan of the listing is unreliable, and the listing itself may be truncated, so a skill you would have chosen can be missing its description. Route by family, and treat a silent listing as a diagnosable fault rather than an absence.

## 1. Triage first

Classify the request before any tool call:

| Request | Route? |
| :--- | :--- |
| Multi-step work: build, fix, refactor, migrate, plan, review, release, research, write, design | **Yes** |
| A single fact, a definition, a syntax reminder, "what does this error mean" | No — just answer |
| The user already typed `/skill-name` | No — the choice is made |
| A step inside a phase you routed a moment ago | No — see checkpoints |

Routing a trivia question burns a turn and teaches the user to ignore the announcement. Missing a real task costs far more. When genuinely torn, route.

## 2. Checkpoints — when to decide again

One check at conversation start decays. Once a workflow skill is engaged, later triggers get missed because the earlier instructions are still in context and feel handled. Re-run the decision at each of these:

- A new task or a new user goal
- Every phase transition: explore → design → plan → implement → test → review → ship
- The domain changes: frontend → infra, code → docs, code → video, application → data
- The first time you touch files in a directory you have not worked in yet — skills in nested `.claude/skills/` load lazily, so new ones may have appeared since the last check
- Immediately after auto-compaction, which drops older skill content
- Whenever the user says "check your skills" or invokes this skill

## 3. Select

1. **Family before name.** Match the task to a family, then pick one skill inside it. See [references/inventory-map.md](references/inventory-map.md) for the map of this install, the five name collisions, and which skills are themselves routers.
2. **Layer, do not pile.** A process skill first — it sets the method — then at most one domain skill that does the work, then at most one style or output skill. Governance protocols outrank generic planning skills.
3. **One family, one skill.** Two members of the same family give Claude two competing methods for one job.
4. **Cap at two, three at the absolute most.** Each invoked skill stays in context for the rest of the session, so every extra one is a permanent tax and a competing set of instructions.
5. **Prefer the most specific match.** A skill scoped to this repo beats a general one; a nested variant beats the root one when you are working in its directory; a qualified `/plugin:skill` beats a bare name that resolves to several skills.
6. **Read before claiming.** A remembered version is not the current version, and announcing without loading is a lie the user cannot see through.

## 4. Load and announce

- Invoke through the Skill tool, or stack several at the start of one message.
- Announce in one line: `Using <skill> to <purpose>.` Nothing more — no preamble, no restating the skill's contents.
- If a skill carries a checklist, create one todo per item. A checklist tracked in your head loses items.
- If a skill's content is already loaded and unchanged, say so briefly and move on. Do not re-announce what is already active.
- Then follow the skill. Loading it and then improvising is worse than not loading it, because the user believes the method was applied.

## 5. When nothing fits

First rule out a truncated listing: with an inventory this size, "no skill for that" and "its description got dropped from the listing" look identical from the inside. If a skill for the job plausibly exists, name your guess and check it rather than concluding it is absent.

Otherwise say so in half a sentence and do the work with general capability. Do not invent a skill name and do not describe a skill you have not opened. If the same gap shows up a third time, that is a skill worth writing — offer it.

Searching the public ecosystem is an install decision, not a routing decision. Do it only when the user asks, and never mid-task.

## 6. What this skill cannot do

A skill makes a behavior likely, not certain — the model still chooses each turn, and no wording changes that. Aggressive phrasing ("you MUST", "even a 1% chance") buys reliability on real tasks and pays for it in false positives on mundane ones, which is why the triage table comes first.

For a step that must hold regardless of what the model decides, use a hook: the harness runs it deterministically. And for this skill to fire on the first message of a session, something already in context has to point at it.

See [references/bootstrap.md](references/bootstrap.md) for the CLAUDE.md line, the SessionStart hook, and the listing-budget diagnostics that decide whether routing can work at all.
