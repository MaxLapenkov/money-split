/**
 * Format minor units (kopecks) to display string: "1 234.56 RUB"
 */
export function formatMoney(amountMinor: number): string {
  const major = amountMinor / 100;
  const formatted = major
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); // non-breaking space
  return `${formatted} RUB`;
}

/**
 * Parse user input (major units string) to minor units (kopecks).
 * Returns NaN for invalid input.
 */
export function parseMoneyInput(value: string): number {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed <= 0) return NaN;
  return Math.round(parsed * 100);
}
