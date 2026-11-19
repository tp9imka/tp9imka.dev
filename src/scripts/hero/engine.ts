// Pure state for the "Try to merge" hero. Each attempt returns the frames the DOM plays;
// the last frame is always a refusal. Nothing here ever merges.
export type Attempt = 'push' | 'skip-qa' | 'edit-guard' | 'retry';
export type Verdict = { sha: string | null; state: 'pass' | 'void' | 'none' };
export type PRState = {
  head: string;
  ci: 'green' | 'red';
  ciRed: number;
  review: Verdict;
  qa: Verdict;
  guard: 'ok' | 'unreadable';
  gate: 'open' | 'refused' | 'parked';
  refusal: string;
  attempts: number;
  merged: 0;
};

export const ATTEMPTS: Attempt[] = ['push', 'skip-qa', 'edit-guard', 'retry'];
const RED_HEADS_BEFORE_PARK = 3;

export function freshPR(sha: string): PRState {
  return {
    head: sha, ci: 'green', ciRed: 0,
    review: { sha, state: 'pass' }, qa: { sha, state: 'pass' },
    guard: 'ok', gate: 'open', refusal: '', attempts: 0, merged: 0,
  };
}

export function applyAttempt(s: PRState, a: Attempt, newSha: () => string): PRState[] {
  const attempts = s.attempts + 1;
  switch (a) {
    case 'push': {
      const head = newSha();
      return [{
        ...s, head, attempts, gate: 'refused',
        review: { sha: s.review.sha, state: 'void' },
        qa: { sha: s.qa.sha, state: 'void' },
        refusal: `VOID: verdicts were for ${s.head}, head is ${head}. No receipt for the head => gate shut.`,
      }];
    }
    case 'skip-qa':
      return [{
        ...s, attempts, gate: 'refused', qa: { sha: null, state: 'none' },
        refusal: `No QA receipt for ${s.head} => the merge guard refuses.`,
      }];
    case 'edit-guard':
      return [{
        ...s, attempts, gate: 'refused', guard: 'unreadable',
        refusal: 'The guard could not read the checks => fail closed. Refusing is the default.',
      }];
    case 'retry': {
      const frames: PRState[] = [];
      let cur: PRState = { ...s, attempts };
      for (let n = 1; n <= RED_HEADS_BEFORE_PARK; n++) {
        const head = newSha();
        cur = {
          ...cur, head, ci: 'red', ciRed: n, gate: 'refused',
          review: { sha: s.review.sha, state: 'void' }, qa: { sha: s.qa.sha, state: 'void' },
          refusal: `CI red ${n}/${RED_HEADS_BEFORE_PARK} on the same check => implementer woken once for ${head}.`,
        };
        frames.push(cur);
      }
      frames.push({
        ...cur, gate: 'parked',
        refusal: `Same check red on ${RED_HEADS_BEFORE_PARK} heads => the driver parks it and re-plans. No more retries.`,
      });
      return frames;
    }
  }
}

// Counts the attempt at click time, so rapid clicks each count even if no frame has played yet.
export function planAttempt(count: number, a: Attempt, newSha: () => string): { frames: PRState[]; count: number } {
  const frames = applyAttempt({ ...freshPR(newSha()), attempts: count }, a, newSha);
  return { frames, count: count + 1 };
}
