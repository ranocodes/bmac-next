export function verifyExpectedAmount(
  webhookAmountKobo: number,
  expectedAmountKobo: number | null | undefined
): boolean {
  if (expectedAmountKobo == null || !Number.isFinite(Number(expectedAmountKobo))) {
    return true;
  }
  const expected = Math.round(Number(expectedAmountKobo));
  const webhook = Math.round(Number(webhookAmountKobo) || 0);
  if (expected <= 0) return true;
  const tolerance = Math.max(Math.round(expected * 0.01), 1);
  return Math.abs(webhook - expected) <= tolerance;
}
