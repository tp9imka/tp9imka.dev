---
title: The QA-fix loop
order: 2
tag: qa
summary: Bug reports become fixes with no human routing. Every QA verdict is bound to the exact commit it judged, and the merge gate needs that receipt.
src: [qa-sha, qa-pr189, qa-employer]
published: true
---

## Constraint

A verdict on old code is worse than no verdict.

## What it refuses

- A second issue for the same bug. Reports are fingerprinted and merged.
- A PASS from an older commit. The verdict names the SHA, and a new push voids it.
- A merge without a receipt. The gate reads it, or refuses.

## Outcome

One PR shipped 11 QA-confirmed defects together, every fix with its verdict bound to its commit.

## What broke

A PASS from an earlier head used to sit next to new code and look current. Binding the verdict to the commit removed that whole category.
