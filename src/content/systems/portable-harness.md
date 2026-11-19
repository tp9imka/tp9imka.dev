---
title: The portable harness
order: 5
tag: harness
summary: One knowledge base and one rule set travel with me across machines and six agent runtimes. The goal is environment parity, not work continuity.
src: [harness]
published: true
---

## Constraint

I work on several machines and with several agent runtimes. Each one has its own config
format, its own memory, its own idea of what the rules are. Rules that live in one tool
die when the tool changes.

## Architecture

- **One git repository is the only channel** between machines. House rules, agent
  definitions, commands and 18 shared skills are linked into each runtime from it.
- **One AGENTS.md, a thin shim per runtime.** Claude Code, Cursor, Kiro, Copilot, Codex and
  a chat bot all read the same manual through their own loader.
- **Memory stays per machine on purpose.** A scan folds each machine's memory into a shared
  wiki with a per-machine watermark, so knowledge travels through git and nothing is
  overwritten.
- **The setup recipe refreshes itself** from the live machine, so a new laptop is a
  conversation, not a weekend.
- **Daily loops run on it:** deterministic fetchers write fact notes every morning and
  evening, and a digest drafts my status. It is never sent automatically.

## Outcome

Six runtimes, one rule set. A rules pack of 89 always-loaded files, about 12k tokens, was
replaced by the house rules.

## What broke

Polling a long command every 30 seconds burned 7.03M input tokens in 33 polls. Now long
commands run through a quiet wrapper that wakes the agent once, on exit.
