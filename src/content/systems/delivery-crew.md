---
title: The delivery crew
order: 1
tag: crew
summary: Agents pick up work, implement, review, run QA and report across three model runtimes. A sweep with no model in it decides who wakes up and when.
src: [crew-roster, crew-sweep, crew-57-86]
published: true
---

## Constraint

One person's attention, three model runtimes, a forge that never stops changing.

## What it refuses

- Waking anyone when the commit did not move. A plain-code sweep runs every 10 minutes and tracks the reviewed SHA.
- A second wake for the same head. Red CI wakes the implementer once.
- A fourth retry. The same check red on 3 heads goes to the driver, who parks or re-plans.

## Outcome

57 of 86 issues closed by the driver under a delivery-speed bar. Time per ticket and cost per PR: not measured yet.

## What broke

- Four shallow approvals landed on a PR that did not compile. Now nothing with a red or pending check gets approved, and 41 earlier approvals were dismissed.
- Batching the reviewer hourly saved money and dropped 4 of 7 real misses. It went back to the 10-minute sweep with review lenses.
