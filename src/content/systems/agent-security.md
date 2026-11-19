---
title: Agent security
order: 4
tag: security
summary: Policy in code, not in the prompt. An allowlist hook on every tool call, message text treated as data, a merge guard that fails closed, and runtime protection that detects the act of hiding.
src: [sec-inbox, sec-merge-guard, sec-rasp, sec-persona]
published: true
---

## Constraint

An inbox agent reads untrusted messages and can send. A prompt that says "be careful" is not a control.

## What it refuses

- Any tool not on the allowlist. A hook runs before every tool call, and every decision is logged.
- Instructions inside a message. Message text is data.
- Sending outside a 1-1 chat. Checked in two places in code.
- A merge past an unreadable check. The guard fails closed.

## Also

An AI assistant inside encrypted groups joins as a visible member with its own key and read-only tools. Removing it revokes access cryptographically. On mobile, runtime protection detects the act of hiding, not the name of the hider.

## What broke

_Story pending._
