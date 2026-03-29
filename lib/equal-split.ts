/**
 * Делит сумму в копейках поровну между участниками.
 * Остаток от деления распределяется по одной копейке; чтобы при нескольких
 * тратам один и тот же человек не накапливал все «лишние» копейки, сдвигаем
 * очередь получателей остатка на rotationOffset (обычно число уже существующих
 * трат в группе по модулю числа участников).
 *
 * Участники сортируются по id для стабильного порядка.
 */
export function buildEqualSplitAmounts(
  amountMinor: number,
  memberIds: string[],
  rotationOffset: number,
): { groupMemberId: string; amountMinor: number }[] {
  const sortedIds = [...memberIds].sort((a, b) => a.localeCompare(b));
  const n = sortedIds.length;
  if (n === 0) return [];

  const base = Math.floor(amountMinor / n);
  const remainder = amountMinor - base * n;
  const offset = ((rotationOffset % n) + n) % n;

  return sortedIds.map((groupMemberId, i) => {
    const pos = ((i - offset) % n + n) % n;
    const extra = pos < remainder ? 1 : 0;
    return { groupMemberId, amountMinor: base + extra };
  });
}
