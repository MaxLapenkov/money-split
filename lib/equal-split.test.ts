import { describe, expect, test } from "bun:test";
import { buildEqualSplitAmounts } from "@/lib/equal-split";

describe("buildEqualSplitAmounts", () => {
  test("empty member list returns empty array", () => {
    expect(buildEqualSplitAmounts(100, [], 0)).toEqual([]);
  });

  test("parts sum exactly to amountMinor", () => {
    const ids = ["c", "a", "b"];
    for (const amount of [0, 1, 99, 100, 10_001]) {
      const parts = buildEqualSplitAmounts(amount, ids, 0);
      const sum = parts.reduce((s, p) => s + p.amountMinor, 0);
      expect(sum).toBe(amount);
    }
  });

  test("sorts member ids lexicographically for stable output order", () => {
    const parts = buildEqualSplitAmounts(100, ["z", "a", "m"], 0);
    expect(parts.map((p) => p.groupMemberId)).toEqual(["a", "m", "z"]);
  });

  test("remainder of 1 kopeck goes to first positions after rotation", () => {
    const ids = ["a", "b", "c"];
    const p0 = buildEqualSplitAmounts(7, ids, 0);
    const p1 = buildEqualSplitAmounts(7, ids, 1);
    expect(p0.map((x) => x.amountMinor).sort((a, b) => a - b)).toEqual([2, 2, 3]);
    expect(p1.map((x) => x.amountMinor).sort((a, b) => a - b)).toEqual([2, 2, 3]);
    expect(p0).not.toEqual(p1);
  });

  test("rotationOffset shifts who gets extra kopecks", () => {
    const ids = ["x", "y"];
    const a = buildEqualSplitAmounts(3, ids, 0);
    const b = buildEqualSplitAmounts(3, ids, 1);
    expect(a.find((p) => p.groupMemberId === "x")!.amountMinor).toBe(2);
    expect(a.find((p) => p.groupMemberId === "y")!.amountMinor).toBe(1);
    expect(b.find((p) => p.groupMemberId === "x")!.amountMinor).toBe(1);
    expect(b.find((p) => p.groupMemberId === "y")!.amountMinor).toBe(2);
  });

  test("negative rotationOffset is normalized with modulo", () => {
    const ids = ["a", "b"];
    const p = buildEqualSplitAmounts(3, ids, -1);
    expect(p.find((x) => x.groupMemberId === "a")!.amountMinor).toBe(1);
    expect(p.find((x) => x.groupMemberId === "b")!.amountMinor).toBe(2);
  });
});
