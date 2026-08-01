---
name: master-wave-governance
description: The fixed planning-and-execution protocol for repositories using MASTERPLAN/wave governance. Use this whenever you plan, start, continue, or finish any non-trivial change — multi-file work, a feature, a refactor, or any bugfix beyond a one-line diff — whenever you write or update a plan, whenever you split work across parallel subagents, or whenever you suspect plan/state drift (e.g. unsure what is done vs. open). Also use it when a repo has no planning structure yet and non-trivial work begins (bootstrap case). Consult and follow this BEFORE writing any plan or code for such work, even if not explicitly asked. Do NOT use for trivial one-line fixes or typo corrections, for pure explanation/analysis tasks that change no files, or in repos that already follow a different, explicitly established planning convention — in that case, follow the repo's own convention.
---

# Master / Wave Governance

The operating protocol for planning and execution. **Two invariants, one lifecycle, six rules.** Follow exactly. Do not improvise an alternative planning structure.

## Invariants (never violate)

1. **State ≠ Work.** Exactly ONE living `docs/MASTERPLAN.md` holds current state + overview. Detailed work lives in short-lived per-wave files. **Never create a second or versioned masterplan** (no `MASTERPLAN-v2`, `-v7`, `-<topic>`). Versioning is Git history, not filenames — a second masterplan file immediately creates two competing sources of truth.
2. **Completion = Move, not flag.** A finished wave file is **moved** to `docs/waves/archive/` with its completion date prepended. Never mark a wave "done" in place. Open-vs-done is determined by file **location**, not a checkbox — so finished work can never be re-read as open, even by an agent that skims filenames without opening files.

## Folder layout

```
docs/
  MASTERPLAN.md                             # single living SSOT (no version suffix)
  waves/active/WAVE-STATE.md                # live status of waves
  waves/active/<NR-N>-WAVE.md               # 1 active, max 2 upcoming waves
  waves/archive/<YYYY-MM-DD>-<NR-N>-WAVE.md # finished waves (moved here on completion)
```

`<NR-N>` is a stable wave id (e.g. `01-1`, `01-2`, `02-1`) that does NOT change when archived. Active wave files are **undated** (in-flight); the completion date is prepended **only** on archival, always in ISO format `YYYY-MM-DD` so the archive sorts chronologically.

**Bootstrap (repo has no structure yet):** If `docs/MASTERPLAN.md` does not exist when non-trivial work begins, create the folder layout and a minimal MASTERPLAN.md (template below) as part of step 1 (PLAN), and mention this to the user when presenting the plan. If the repo visibly follows a *different* established planning convention, do not impose this one — say so and follow the repo's convention instead.

## Lifecycle (the fixed flow — run in order)

1. **PLAN** — New work → create `waves/active/<NR-N>-WAVE.md` (template below). Add ONE pointer line under MASTERPLAN.md → "Active Waves", and one line under `WAVE-STATE.md`. Present the plan and get approval before executing.
2. **EXECUTE** — Work against the wave file. Track live progress in `waves/active/WAVE-STATE.md` (the shared board) — **not** in MASTERPLAN.md (it stays stable during execution).
3. **DRIFT** — Any unplanned bugfix/change → append it as a task to the active `<NR-N>-WAVE.md` (or spawn a tiny new wave file), expressed as a delta, and reflect it in `WAVE-STATE.md`. **Never make an orphan edit** that isn't reflected in a wave.
4. **ARCHIVE** — When the wave's Acceptance is met: **move** the file to `waves/archive/<YYYY-MM-DD>-<NR-N>-WAVE.md` (prepend the completion date; the wave id stays stable). Remove its line from `WAVE-STATE.md` → Active. Then update MASTERPLAN.md: refresh "Current State" with the result, and replace the wave's "Active" pointer with a one-line "Shipped" index entry.
5. **RECONCILE** — Periodically verify MASTERPLAN.md "Current State" matches reality. If OpenSpec is in use: run `/opsx:sync`.

### Edge cases

- **Cancelled/abandoned wave:** Never delete it (history matters) and never leave it in `active/` (it would read as open). Move it to `waves/archive/<YYYY-MM-DD>-<NR-N>-WAVE.md` like a completed wave, but set `_Status: cancelled — <one-line reason>_` in its header first, and list it under "Shipped (index)" with a `✗ cancelled` marker instead of `✓`.
- **Wave outgrows ~10 steps mid-execution:** Split, don't bloat. Keep the tasks already in progress in the current wave, move the not-yet-started remainder into a new `<NR-N>-WAVE.md` (next id), and tighten the current wave's Acceptance to match what stays. Reflect both in `WAVE-STATE.md`.
- **A second wave must run in parallel (e.g. urgent hotfix during a feature wave):** Allowed as a temporary exception — two active waves maximum, and they must not touch the same files (check both Scope sections). List both under "Active" in `WAVE-STATE.md`. Prefer folding a small fix into the running wave via DRIFT; only open a parallel wave when the fix is unrelated to the running wave's scope.

## Rules (hard)

1. **One masterplan.** Never spawn per-phase or per-topic masterplans.
2. **Repo-language before schedule-language.** Every task names the real path(s) + a plain verb-object (e.g. "fix bootstrap order in `sidebar/Shell.tsx`"). Name tasks after **what they touch in the repo**, never after their position in a parallel schedule.
3. **Codes are suffixes.** Wave/batch/agent labels (`[batch-B]`, `[W3]`) go in brackets at the **end** of a line — never as a title, never as the primary reference. Schedule codes rot the moment the plan changes; repo paths stay stable and remain greppable, so the path must carry the meaning.
4. **Isolate the DAG.** Parallelization and dependencies live ONLY in a fenced "Execution order" block at the bottom of the wave file. The DAG changes far more often than the tasks themselves — keeping it separate means rescheduling never churns the task list, and the task list stays readable without decoding scheduling syntax.
5. **Pointer-gate.** If a plan cannot be read and mapped directly to repo files, it is too cryptic — rewrite it. Reject plans with more than ~10 steps; split into separate waves.
6. **Scope anchor.** Every wave file has explicit **In / Out (YAGNI)**. When an "it'd be nice to also…" appears mid-execution, the answer is the Out list.

## Parallel execution with subagents

When splitting a wave across parallel subagents:

- **Single writer for shared state.** Only the orchestrator (the main agent) writes `WAVE-STATE.md` and the wave file. Subagents never edit governance files — parallel writers on the same board produce lost updates and conflicting status. Subagents report results back; the orchestrator folds them into `WAVE-STATE.md`.
- **Hand each subagent its slice, plus context.** A subagent's prompt gets: (a) its own task lines verbatim from the wave file (real paths + verification), (b) the wave's Goal and Scope (In/Out) so it can say no to scope creep, and (c) NOT the DAG — scheduling is the orchestrator's job. Do not hand a subagent the entire wave file as its task list; it will be tempted to do neighboring tasks.
- **Partition by files, verify before merge.** Only parallelize tasks whose path sets are disjoint (read them off the task lines — this is why tasks name real paths). After subagents return, the orchestrator runs each task's verification step before marking it done on the board.
- **Subagent drift is still drift.** If a subagent reports it had to make an unplanned change, the orchestrator records it via the DRIFT step — same as its own unplanned edits.

## MASTERPLAN.md template (keep small — a map, not a logbook)

```markdown
# <Repo> Masterplan
_Last reconcile: <YYYY-MM-DD>_

## Current State     # what the system does NOW (1–3 lines per capability) — this is the SSOT
## Active Waves      # pointer list, 1 line + link each; NO task detail
## Roadmap (coarse)  # what's next, coarse-grained; NO tasks
## Shipped (index)   # thin index of archived waves: date + id + name + link ✓ (or ✗ cancelled)
```

## WAVE-STATE.md template (the shared live board in `waves/active/`)

```markdown
# Wave State
_Updated: <YYYY-MM-DD>_

## Active (normally 1, max 2 — see edge cases)
- <NR-N> <title> — step <2/5 EXECUTE> · <current task / short status> · blockers: <none>

## Upcoming (max 2)
- <NR-N> <title> — queued
```

## Wave file template (`<NR-N>-WAVE.md`)

```markdown
# Wave <NR-N>: <repo-anchored title>
_Status: active · created <YYYY-MM-DD>_

## Goal             # 1–2 plain sentences
## Scope            # In: <paths/features>   ·   Out (YAGNI): <explicitly excluded>
## Tasks            # each: real path(s) + plain description + verification; [code] only as a suffix
## Acceptance       # concrete done-criteria
## Execution order  # the parallel DAG lives HERE only, separated from the task list
```

## Do NOT

- Let MASTERPLAN.md grow into a logbook — history belongs in `archive/`.
- Leave a cancelled wave sitting in `active/`, or delete it — archive it with a `cancelled` status.
- Hand governance-file write access to subagents — orchestrator writes, subagents report.