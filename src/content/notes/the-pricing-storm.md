---
title: The pricing storm
date: 2026-09-13
summary: Two small decisions in my product added up to an overloaded storage object. How the agent crew found it, fixed it in three days, and caused one incident of its own on the way.
---

**What users saw:** "asset not available" in the editor, and the storage object behind each
workspace reporting itself as overloaded.

**What was actually happening.** Two small decisions met:

- Every save, and every 5 minutes, the workspace took a full compressed snapshot of its media
  tree, under the same lock that writes needed. Snapshots were never pruned.
- The pricing client turned one rejected batch into N+1 single requests that could not be
  cached. One busy page could flood the object on its own.

Each was fine alone. Together, a 1 MB write could wait for a whole snapshot, and the pricing
retries piled up behind it.

**How it was fixed.** I ran it as a programme with my agent crew: a spec, measured numbers
first, one plan per fix, review and gates on every PR.

- Pricing: fall back to single requests only on the right error codes, a 3 s refresh floor, a
  60 s cache for unpriced items, coalesced refreshes.
- Snapshots: a 60 s floor, a fingerprint check so idle workspaces answer "unchanged" instead of
  re-snapshotting, faster compression, keep 3 generations, and the lock only around the
  database backup.
- Then the bigger move: media moved out of the snapshot into object storage, one workspace
  at a time, each one verified and reversible before the next.

After the first two merges the pricing storm was gone, and idle workspaces stopped snapshotting.

**What broke on the way.**

- **Merged is not live.** The deploy job waited on a self-hosted runner that was offline. For
  hours nothing merged had shipped. Now the gate checks the deploy run, not the merge.
- **The crew caused one incident itself.** A maintenance dry run restored a workspace without
  a user identity, and the container answered 503 to everything after it. It was contained the
  same night, and the fix became a rule: maintenance paths carry their own identity, and dry
  runs go to an empty workspace first.

**What I took from it.** Small defaults compound. Measure the cost of each one before blaming
traffic. And an agent that is allowed to run maintenance needs the same gates as one that
writes code.
