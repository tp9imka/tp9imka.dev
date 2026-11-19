// The merge guard's rule: review and QA must both match the current head.
export type CrewCard = { head: string | null; review: string | null; qa: string | null };

export function hasReceipts(c: CrewCard): boolean {
  return !!c.head && c.review === c.head && c.qa === c.head;
}

export function missingReceipt(c: CrewCard): string {
  if (!c.head) return 'no commits on this card';
  if (c.qa && c.qa !== c.head) return `PASS @${c.qa} is void, head is @${c.head}`;
  if (c.review !== c.head) return `no review @${c.head}`;
  if (c.qa !== c.head) return `no QA PASS @${c.head}`;
  return '';
}
