export function closeLine(tries: number): string {
  if (tries <= 0) return 'Nothing merges here without proof.';
  return `You tried ${tries === 1 ? 'once' : `${tries} times`}. Nothing got through.`;
}
