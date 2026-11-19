---
title: Decision automation
order: 3
tag: decisions
summary: A driver agent rules on product questions as my proxy, posts every ruling with an undo, and only scope changes reach me. Requirements are re-scored every night.
src: [decide-proxy, decide-rescore]
published: true
---

## Constraint

Agents stall on questions. If every question comes to me, I am the bottleneck. If none
do, the crew quietly changes the product.

## Architecture

- **Rulings with an undo.** The driver answers inside-scope product questions itself and
  posts `Decided for Ivan: ... - undo:`. Every ruling is appended to a rulings log the
  crew reads. Agents ask the driver, never me.
- **What still reaches me:** scope changes, new commitments to other teams, and anything
  I reserved. Nothing else.
- **Nightly re-score.** Each night the requirements board is snapshotted and diffed against
  the night before. New stories are scored from scratch. Changed text is re-derived, and
  criteria drift is tracked with a hash per story.
- **Movement is split** into like-for-like progress and scope change, so a moving target
  does not look like progress.
- **At most 3 grouped questions a night** go to the product owner. Gaps feed the driver's
  pickup ranking.

## Outcome

A decision trail I can audit and reverse, instead of a chat history nobody reads.
Number of rulings undone: not measured yet.

## What broke

_Story pending._
