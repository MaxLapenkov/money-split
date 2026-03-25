/** Business cap: 9 999 999.99 RUB per expense (minor units). */
export const MAX_EXPENSE_AMOUNT_MINOR = 999_999_999;

export const MAX_EXPENSE_AMOUNT_MAJOR = MAX_EXPENSE_AMOUNT_MINOR / 100;

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
 * Expense / income lines: prefix + same format as formatMoney (policy).
 */
export function formatSignedExpenseAmount(
  amountMinor: number,
  type: "expense" | "income"
): string {
  const sign = type === "income" ? "+" : "−";
  return `${sign}${formatMoney(amountMinor)}`;
}

/**
 * Parse user input (major units string) to minor units (kopecks).
 * Returns NaN for invalid input.
 */
export function parseMoneyInput(value: string): number {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed <= 0) return NaN;
  const minor = Math.round(parsed * 100);
  if (minor > MAX_EXPENSE_AMOUNT_MINOR) return NaN;
  return minor;
}
