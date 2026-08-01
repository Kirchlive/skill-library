---
name: think-in-config-language
description: Makes extended thinking happen in the language configured via the `language` setting in Claude Code's settings.json (the "Enter your preferred response and voice language" prompt in /config), instead of defaulting to English. Use this at the start of any task that involves extended thinking, planning, analysis, debugging, or multi-step reasoning — which is most non-trivial work. Consult it whenever the user works in a language other than English, whenever thinking blocks appear in a language the user did not configure, and whenever the user mentions thinking language, reasoning language, Denksprache, or asks why Claude thinks in English while answering in another language.
---

# Think in the configured language

Claude Code's `language` setting governs the *response* language. Extended thinking is not covered by it and tends to fall back to English. For a user who reads the thinking stream — to follow the reasoning, catch a wrong turn early, or interrupt — a thinking block in the wrong language defeats the purpose of having the setting at all.

This skill closes that gap: think in the same language the answer will be written in.

## Resolve the language once per session

Read the `language` value from settings, highest precedence first. Later files override earlier ones:

1. `~/.claude/settings.json` (user)
2. `.claude/settings.json` (project)
3. `.claude/settings.local.json` (local)

```bash
for f in ~/.claude/settings.json .claude/settings.json .claude/settings.local.json; do
  [ -f "$f" ] && python3 -c "import json,sys;print(json.load(open('$f')).get('language',''))" 2>/dev/null
done | grep -v '^$' | tail -1
```

The value is a plain language name — `german`, `japanese`, `spanish`. Empty output means the setting is unset: in that case, use the language the user writes in, which is what Claude Code does for responses anyway.

Do this lookup **once**, at the start of the session or the first time this skill applies. Do not re-read the files on every turn — the setting does not change mid-session, and a bash call per thinking block costs more than it is worth.

## Then think in that language

Everything inside extended thinking — hypotheses, weighing options, planning steps, talking yourself out of a wrong approach — goes in the resolved language.

Keep these in their original form regardless of language, because translating them makes the thinking harder to follow, not easier:

- Code, identifiers, file paths, commands, flags
- Error messages and log output being quoted or reasoned about
- Library, API, framework, and tool names
- Established technical terms with no natural equivalent (`race condition`, `merge conflict`, `garbage collection`) — a forced translation is worse than the loanword. Mixing them into a sentence in the target language is normal and correct; that is how developers actually speak.

So in German: *"Der Test schlägt fehl, weil `verifyToken` bei abgelaufenen Tokens `null` zurückgibt statt zu werfen — das ist eine race condition mit dem refresh handler."* Not a purified translation, and not English.

## Two things to avoid

**Don't narrate the switch.** No "I will now think in German" and no apologising for a slip. If a thinking block drifts into English mid-way, just continue in the target language from the next sentence. Meta-commentary about the language costs tokens and tells the user nothing.

**Don't let it bleed into artifacts.** Commit messages, code comments, variable names, documentation, and PR descriptions follow the conventions of the repository, not this skill. A German-speaking user working in an English codebase still wants English commit messages. If the repository's existing comments and commits are in the configured language, match that — the repository decides, not the setting.

## Scope

This affects thinking only. The response language is already handled by the `language` setting itself, so nothing here should change what the user sees in the answer.

Thinking is less steerable than output — treat this as a strong preference that will hold most of the time rather than a guarantee, and don't spend effort policing it.
