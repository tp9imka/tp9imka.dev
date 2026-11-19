---
title: Decision automation
order: 3
tag: decisions
summary: A driver agent rules on product questions as my proxy, posts every ruling with an undo, and only scope changes reach me. Requirements are re-scored every night.
src: [decide-proxy, decide-rescore]
published: true
---

## Constraint

Agents stall on questions. If every question reaches me, I am the bottleneck. If none do, the crew quietly changes the product.

## What it refuses

- Asking me inside scope. The driver rules, posts "Decided for Ivan: ... - undo", and logs it.
- Deciding scope changes or new commitments to other teams. Those wake me.
- More than 3 questions a night to the product owner. Requirements are re-scored nightly, with a hash per story to catch drift.

## Outcome

A decision trail I can audit and reverse. Rulings undone: not measured yet.

## What broke

_Story pending._
