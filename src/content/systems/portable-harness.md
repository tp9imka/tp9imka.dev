---
title: The portable harness
order: 5
tag: harness
summary: One knowledge base and one rule set travel with me across machines and six agent runtimes. The goal is environment parity, not work continuity.
src: [harness]
published: true
---

## Constraint

Several machines, six agent runtimes, each with its own config and memory. Rules that live in one tool die with it.

## What it refuses

- Rules that drift. One git repository is the only channel. One AGENTS.md, a thin shim per runtime.
- Memory that overwrites memory. Each machine keeps its own; a watermarked scan folds it into a shared wiki.

## Outcome

Six runtimes, one rule set, 18 shared skills. A new laptop is a conversation, not a weekend.

## What broke

Polling a long command every 30 seconds burned 7.03M input tokens in 33 polls. Now long commands wake the agent once, on exit.
