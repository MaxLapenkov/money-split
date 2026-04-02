import { describe, expect, test } from "bun:test";
import {
  formatMoney,
  formatSignedExpenseAmount,
  MAX_EXPENSE_AMOUNT_MINOR,
  parseMoneyInput,
} from "@/lib/money";

describe("formatMoney", () => {
  test("formats kopecks as major with nbsp thousands and RUB suffix", () => {
    expect(formatMoney(123_456)).toBe("1\u00a0234.56 RUB");
    expect(formatMoney(0)).toBe("0.00 RUB");
  });
});

describe("formatSignedExpenseAmount", () => {
  test("prefixes expense vs income", () => {
    expect(formatSignedExpenseAmount(100, "expense")).toBe("−1.00 RUB");
    expect(formatSignedExpenseAmount(100, "income")).toBe("+1.00 RUB");
  });
});

describe("parseMoneyInput", () => {
  test("parses valid positive amounts to minor units", () => {
    expect(parseMoneyInput("10")).toBe(1_000);
    expect(parseMoneyInput("10.5")).toBe(1_050);
    expect(parseMoneyInput("1 234,56")).toBe(123_456);
  });

  test("returns NaN for invalid or out-of-range input", () => {
    expect(Number.isNaN(parseMoneyInput(""))).toBe(true);
    expect(Number.isNaN(parseMoneyInput("0"))).toBe(true);
    expect(Number.isNaN(parseMoneyInput("-5"))).toBe(true);
    expect(Number.isNaN(parseMoneyInput("not-a-number"))).toBe(true);
    const tooHigh = (MAX_EXPENSE_AMOUNT_MINOR / 100 + 1).toFixed(2);
    expect(Number.isNaN(parseMoneyInput(tooHigh))).toBe(true);
  });

  test("accepts amount at business cap", () => {
    expect(parseMoneyInput("9999999.99")).toBe(MAX_EXPENSE_AMOUNT_MINOR);
  });
});
