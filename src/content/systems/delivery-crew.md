---
title: The delivery crew
order: 1
tag: crew
summary: Agents pick up work, implement, review, run QA and report across three model runtimes. A sweep with no model in it decides who wakes up and when.
src: [crew-roster, crew-sweep, crew-57-86]
published: true
---

## Constraint

One person's attention, real product work, three model runtimes with their own quotas
and outages, and a forge that never stops changing. Agents that poll burn money.
Agents that wake on every event step on each other.

## Architecture

- **Roles, not one big agent.** Driver (acts as my proxy), researcher, orchestrator,
  implementer (the only one who pushes), reviewer, checker, script runner, release and
  report, inbox, machine health, QA.
- **The sweep is plain code.** Every 10 minutes a deterministic script reads every open PR
  and keeps one board item per PR with the SHA it last reviewed. Nothing wakes unless that
  SHA moved.
- **One wake per head.** Red CI or a merge conflict wakes the implementer once for that
  commit. A failed review run is retried once per head, never in a loop.
- **Escalation is counted.** The same check red on 2 to 3 heads in a row goes to the driver,
  who parks the PR or re-plans it.
- **Behind its base?** The sweep updates the branch itself. No model needed.

## Outcome

Under a delivery-speed bar the driver closed 57 of 86 issues. That is a count of work done,
not a success rate. Time per ticket, review minutes and cost per merged PR are not measured
yet.

## What broke

- Four shallow approvals landed on a PR that did not compile. Since then the reviewer may not
  approve anything with a red or pending check, re-reviews cover the whole PR, and changed
  API shapes trigger a search for every consumer. 41 earlier approvals were dismissed.
- The reviewer was queued about 100 runs a day, up to 30 an hour. Batching it hourly fixed
  the cost and broke the quality: the batch rule made it see and drop 4 of 7 real misses.
  It went back to the 10-minute sweep with explicit review lenses and a "write the failure
  or drop it" rule.
- A runtime hit its weekly limit mid-day. Queued runs keep the runtime they were queued
  with, so a switch means cancel and re-run, not just flip a setting.
