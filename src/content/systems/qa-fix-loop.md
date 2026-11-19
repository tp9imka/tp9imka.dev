---
title: The QA-fix loop
order: 2
tag: qa
summary: Bug reports become fixes with no human routing. Every QA verdict is bound to the exact commit it judged, and the merge gate needs that receipt.
src: [qa-sha, qa-pr189, qa-employer]
published: true
---

## Constraint

A verdict on old code is worse than no verdict. Agents push often, and a "QA passed" that
was true three commits ago looks exactly like one that is true now.

## Architecture

- **Reports in, one issue out.** Bug reports from shipped builds are fingerprinted.
  Duplicates merge into one issue instead of five parallel fixes.
- **Fix, review, then QA.** The implementer fixes, the reviewer reviews, the QA agent returns
  `PASS`, `FAIL` or `BLOCKED` for one exact head SHA.
- **A new commit voids the verdict.** Nobody has to remember to re-check. The verdict simply
  stops matching the head.
- **Receipts.** Every gate run writes a validation receipt keyed by the tree. The merge gate
  fails without one.
- **Red CI becomes work.** A QA agent turns red CI on a crew PR into a fix request for the
  implementer, instead of a person reading logs.

## Outcome

One PR shipped 11 QA-confirmed defects together, with 16,522 tests passing.

## What broke

Before verdicts carried a SHA, a PASS from an earlier head could sit next to new code and
read as current. Binding the verdict to the commit removed the whole category: there is
no "stale but green" state left to notice.
