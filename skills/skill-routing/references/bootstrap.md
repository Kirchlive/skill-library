# Bootstrap and diagnostics

Read this when setting the skill up, or when routing has stopped happening and you need to find out why.

## The bootstrap problem

A skill's body loads only once something invokes it. A skill whose job is "check for skills at the start of every task" therefore has to be pointed at by something that is already in context on turn one. Two options, in increasing order of reliability.

### Option A — CLAUDE.md pointer (cheap, portable)

Three lines in `CLAUDE.md`, always in context, no setup:

```markdown
## Skill routing

Before starting any multi-step task, and again at every phase change, invoke the
`skill-routing` skill and follow it. Skip it for single-fact questions.
```

This is the right layer for the pointer: it is a short always-true fact. The procedure itself stays in the skill, where it costs nothing until it is needed.

### Option B — SessionStart hook (fires on startup, clear, and compact)

A hook runs in the harness, not in the model, so it does not depend on the model deciding anything. Save this as `~/.claude/hooks/session-start-routing.sh`, make it executable:

```bash
#!/usr/bin/env bash
set -euo pipefail
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' \
  "Before any multi-step task and at every phase change, invoke the skill-routing skill and follow it. Skip it for single-fact questions."
```

Register it in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|clear|compact",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/session-start-routing.sh", "shell": "bash", "async": false }
        ]
      }
    ]
  }
}
```

The `compact` matcher is the part that earns its keep: compaction is exactly where skill content gets dropped and routing quietly stops.

Inject a **pointer**, not the whole skill body. Injecting the full text on every session start pays the token cost on every session, including the ones that never leave chat.

## Diagnostics — start with the budget

With roughly 290 skills installed, the listing budget is the dominant failure mode, not the descriptions themselves. Claude Code loads a listing of every skill name plus its description so Claude knows what exists. The listing always contains every **name**, but when it overflows its budget, Claude Code shortens **descriptions**, dropping them from the skills you invoke least first. A skill whose description has been dropped is effectively unroutable: Claude sees a bare name and nothing to match a request against.

The budget scales at 1% of the model's context window. As a floor estimate, the abbreviated one-line summaries of this install already total around 17,800 characters — and real `description` fields run several times longer than those one-liners. Measure it rather than guessing:

- `/doctor` — an estimate of the listing's context cost and its biggest contributors
- `/context` — the Skills row, reported *after* the budget is applied, so it matches what the model actually receives
- `--debug` — writes a warning to the debug log when the listing exceeds its budget

Three levers, in the order worth trying:

1. **Demote whole families you rarely use.** In `skillOverrides`, set them to `"name-only"` so they list without a description, or `"off"` to hide them entirely. Namespaces like the 26 Vercel skills or the 8 HyperFrames skills are prime candidates on days you touch neither.

   ```json
   { "skillOverrides": { "azure-host-pptx": "off", "olive-rose-pptx": "off", "kokoro": "name-only" } }
   ```

2. **Raise the budget** with `skillListingBudgetFraction` (e.g. `0.02` for 2%) or a fixed character count in `SLASH_COMMAND_TOOL_CHAR_BUDGET`. This buys room and costs context on every turn — measure before and after.

3. **Trim at the source.** Each entry's combined `description` and `when_to_use` is capped at 1,536 characters regardless of budget, configurable via `skillListingMaxDescChars`. Put the key use case first so truncation cuts the tail, not the trigger.

Also worth knowing: a skill set to `disable-model-invocation: true` has no description in context at all, so it can never be routed to — that is the setting to use for anything you only ever want to run by hand, and it frees listing budget as a side effect.

## Other symptoms

| Symptom | Check | Fix |
| :--- | :--- | :--- |
| A skill never fires on its own | Is it listed with a description? Ask "what skills are available?" | Strengthen the description with the phrases actually typed; check the budget first |
| Fires on trivia | The description is too broad | Narrow it, or scope activation with `paths` |
| Worked early, stopped later | Compaction dropped the content | Re-invoke; add the `compact` matcher above |
| `/skill-routing` works, automatic loading does not | The body is fine, the description is the problem | Front-load the trigger phrases |
| Two skills answer to one name | A collision — five exist in this install | Use the qualified `/plugin:skill` form; see `inventory-map.md` |

## Housekeeping

Duplicate and dead entries cost budget for nothing. `reddit-post-writer` is currently installed twice under `happycapy-skills`; a periodic pass over the inventory for duplicates, superseded versions such as `design-taste-frontend-v1`, and families you no longer use is the cheapest budget you will ever recover.

## Choosing the layer

| Need | Layer |
| :--- | :--- |
| A short always-true fact | `CLAUDE.md` |
| A procedure that is only sometimes relevant | Skill |
| A step that must never be skipped | Hook |
| Work that needs its own context window | Subagent, or `context: fork` on the skill |

Routing is a procedure, so it belongs in a skill. The pointer to it is a fact, so it belongs in `CLAUDE.md` or a hook. Putting the whole procedure in `CLAUDE.md` taxes every turn; putting the pointer in a skill means nothing ever loads it.
