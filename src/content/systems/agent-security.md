---
title: Agent security
order: 4
tag: security
summary: Policy in code, not in the prompt. An allowlist hook on every tool call, message text treated as data, a merge guard that fails closed, and runtime protection that detects the act of hiding.
src: [sec-inbox, sec-merge-guard, sec-rasp, sec-persona]
published: true
---

## Constraint

An inbox agent reads untrusted messages and has real send rights. A merge agent can ship
to production. A prompt that says "be careful" is not a control.

## Architecture

- **A hook before every tool call.** The inbox agent may call only named tools, read only
  inside its own folder, and run only allowlisted commands. Every decision, allow or deny,
  goes to an audit log.
- **Message text is data.** Instructions inside a message are never followed. They are
  content to summarise or route.
- **Auto-send only to 1-1 chats,** enforced in two separate places in code.
- **The merge guard fails closed.** If it cannot read the check state, it refuses. Agents
  cannot merge past a red or unknown check.
- **An AI assistant inside encrypted groups** joins as a visible member with its own key,
  read-only tools and owner-only sends. Removing it revokes access cryptographically.
- **Runtime protection for mobile apps:** detect the act of hiding, not the name of the
  hider. Inline-hook and prologue integrity checks, plus a differential that catches a
  tracer that hides itself.

## Outcome

A live run confirmed the hook blocks. Allow and deny counts from the audit log: not
pulled yet.

## What broke

_Story pending._
