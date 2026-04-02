import { describe, expect, test } from "bun:test";
import type { DbExpense, DbExpenseSplit, DbGroupMember } from "@/lib/supabase/types";
import {
  applyPaidSettlementsToBalances,
  calculateBalances,
  calculateSettlements,
  netBalancesSumToZero,
  type Balance,
} from "@/lib/settlement";

const iso = "2025-01-01T00:00:00.000Z";

function member(id: string, name: string): DbGroupMember {
  return {
    id,
    group_id: "g1",
    display_name: name,
    role: "member",
    created_at: iso,
  };
}

function expense(
  id: string,
  type: "expense" | "income",
  groupMemberId: string,
  amountMinor: number,
): DbExpense {
  return {
    id,
    group_id: "g1",
    type,
    group_member_id: groupMemberId,
    note: "",
    amount_minor: amountMinor,
    currency: "RUB",
    expense_date: "2025-01-01",
    created_by_user_id: "u1",
    created_at: iso,
  };
}

function split(
  id: string,
  expenseId: string,
  groupMemberId: string,
  amountMinor: number,
): DbExpenseSplit {
  return { id, expense_id: expenseId, group_member_id: groupMemberId, amount_minor: amountMinor };
}

describe("calculateBalances", () => {
  test("one expense: payer credited, split participants owe shares; nets sum to zero", () => {
    const a = member("m-a", "A");
    const b = member("m-b", "B");
    const members = [a, b];
    const expenses = [expense("e1", "expense", "m-a", 10_000)];
    const splits = [
      split("s1", "e1", "m-a", 5_000),
      split("s2", "e1", "m-b", 5_000),
    ];
    const balances = calculateBalances(members, expenses, splits);
    const byId = Object.fromEntries(balances.map((b) => [b.groupMemberId, b.netMinor]));
    expect(byId["m-a"]).toBe(5_000);
    expect(byId["m-b"]).toBe(-5_000);
    expect(netBalancesSumToZero(balances)).toBe(true);
  });

  test("two expenses accumulate", () => {
    const a = member("m-a", "A");
    const b = member("m-b", "B");
    const members = [a, b];
    const expenses = [
      expense("e1", "expense", "m-a", 100),
      expense("e2", "expense", "m-b", 200),
    ];
    const splits = [
      split("s1", "e1", "m-a", 50),
      split("s2", "e1", "m-b", 50),
      split("s3", "e2", "m-a", 100),
      split("s4", "e2", "m-b", 100),
    ];
    const balances = calculateBalances(members, expenses, splits);
    const byId = Object.fromEntries(balances.map((b) => [b.groupMemberId, b.netMinor]));
    expect(byId["m-a"]).toBe(-50);
    expect(byId["m-b"]).toBe(50);
    expect(netBalancesSumToZero(balances)).toBe(true);
  });

  test("income: current formula does not zero-sum splits (regression; policy expects zero-sum for balanced books)", () => {
    const a = member("m-a", "A");
    const b = member("m-b", "B");
    const members = [a, b];
    const expenses = [expense("e1", "income", "m-a", 10_000)];
    const splits = [
      split("s1", "e1", "m-a", 5_000),
      split("s2", "e1", "m-b", 5_000),
    ];
    const balances = calculateBalances(members, expenses, splits);
    const byId = Object.fromEntries(balances.map((b) => [b.groupMemberId, b.netMinor]));
    expect(byId["m-a"]).toBe(-15_000);
    expect(byId["m-b"]).toBe(-5_000);
    expect(netBalancesSumToZero(balances)).toBe(false);
  });
});

describe("netBalancesSumToZero", () => {
  test("returns true only when sum of netMinor is 0", () => {
    const ok: Balance[] = [
      { groupMemberId: "a", displayName: "A", netMinor: 100 },
      { groupMemberId: "b", displayName: "B", netMinor: -100 },
    ];
    const bad: Balance[] = [
      { groupMemberId: "a", displayName: "A", netMinor: 1 },
      { groupMemberId: "b", displayName: "B", netMinor: 2 },
    ];
    expect(netBalancesSumToZero(ok)).toBe(true);
    expect(netBalancesSumToZero(bad)).toBe(false);
  });
});

describe("applyPaidSettlementsToBalances", () => {
  test("empty paid leaves balances unchanged", () => {
    const balances: Balance[] = [
      { groupMemberId: "a", displayName: "A", netMinor: -100 },
      { groupMemberId: "b", displayName: "B", netMinor: 100 },
    ];
    const next = applyPaidSettlementsToBalances(balances, []);
    expect(next).toEqual(balances);
  });

  test("one paid transfer reduces debtor debt and creditor claim", () => {
    const balances: Balance[] = [
      { groupMemberId: "a", displayName: "A", netMinor: -100 },
      { groupMemberId: "b", displayName: "B", netMinor: 100 },
    ];
    const next = applyPaidSettlementsToBalances(balances, [
      { fromGroupMemberId: "a", toGroupMemberId: "b", amountMinor: 40 },
    ]);
    const byId = Object.fromEntries(next.map((b) => [b.groupMemberId, b.netMinor]));
    expect(byId["a"]).toBe(-60);
    expect(byId["b"]).toBe(60);
  });
});

describe("calculateSettlements", () => {
  test("all zero nets yields no suggestions", () => {
    const balances: Balance[] = [
      { groupMemberId: "a", displayName: "A", netMinor: 0 },
      { groupMemberId: "b", displayName: "B", netMinor: 0 },
    ];
    expect(calculateSettlements(balances)).toEqual([]);
  });

  test("single debtor and single creditor: one transfer for full amount", () => {
    const balances: Balance[] = [
      { groupMemberId: "a", displayName: "A", netMinor: -100 },
      { groupMemberId: "b", displayName: "B", netMinor: 100 },
    ];
    const s = calculateSettlements(balances);
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({
      fromGroupMemberId: "a",
      toGroupMemberId: "b",
      amountMinor: 100,
    });
  });

  test("greedy: one debtor settles with two creditors (min transfer each step)", () => {
    const balances: Balance[] = [
      { groupMemberId: "m1", displayName: "M1", netMinor: -100 },
      { groupMemberId: "m2", displayName: "M2", netMinor: 50 },
      { groupMemberId: "m3", displayName: "M3", netMinor: 50 },
    ];
    const s = calculateSettlements(balances);
    expect(s).toHaveLength(2);
    expect(s[0].amountMinor + s[1].amountMinor).toBe(100);
    expect(s[0]).toMatchObject({ fromGroupMemberId: "m1", toGroupMemberId: "m2", amountMinor: 50 });
    expect(s[1]).toMatchObject({ fromGroupMemberId: "m1", toGroupMemberId: "m3", amountMinor: 50 });
  });

  test("greedy: larger debtor paired before smaller (sort by debt amount desc)", () => {
    const balances: Balance[] = [
      { groupMemberId: "d-small", displayName: "S", netMinor: -40 },
      { groupMemberId: "d-big", displayName: "B", netMinor: -80 },
      { groupMemberId: "c1", displayName: "C1", netMinor: 60 },
      { groupMemberId: "c2", displayName: "C2", netMinor: 60 },
    ];
    const s = calculateSettlements(balances);
    expect(s[0].fromGroupMemberId).toBe("d-big");
    expect(s[0].amountMinor).toBe(60);
    expect(s[1].fromGroupMemberId).toBe("d-big");
    expect(s[1].amountMinor).toBe(20);
    expect(s[2].fromGroupMemberId).toBe("d-small");
    expect(s[2].amountMinor).toBe(40);
  });

  test("greedy: partial transfers when creditor exhausted before debtor (spec two-pointer)", () => {
    const balances: Balance[] = [
      { groupMemberId: "d1", displayName: "D1", netMinor: -80 },
      { groupMemberId: "d2", displayName: "D2", netMinor: -40 },
      { groupMemberId: "c1", displayName: "C1", netMinor: 70 },
      { groupMemberId: "c2", displayName: "C2", netMinor: 50 },
    ];
    const s = calculateSettlements(balances);
    expect(s).toHaveLength(3);
    expect(s[0]).toMatchObject({ fromGroupMemberId: "d1", toGroupMemberId: "c1", amountMinor: 70 });
    expect(s[1]).toMatchObject({ fromGroupMemberId: "d1", toGroupMemberId: "c2", amountMinor: 10 });
    expect(s[2]).toMatchObject({ fromGroupMemberId: "d2", toGroupMemberId: "c2", amountMinor: 40 });
  });

  test("deterministic: same input twice yields identical suggestions", () => {
    const balances: Balance[] = [
      { groupMemberId: "z", displayName: "Z", netMinor: -30 },
      { groupMemberId: "a", displayName: "A", netMinor: -30 },
      { groupMemberId: "b", displayName: "B", netMinor: 60 },
    ];
    const once = calculateSettlements(balances);
    const twice = calculateSettlements(balances);
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice));
  });

  test("tie-break on groupMemberId when debt amounts equal", () => {
    const balances: Balance[] = [
      { groupMemberId: "debtor-b", displayName: "B", netMinor: -50 },
      { groupMemberId: "debtor-a", displayName: "A", netMinor: -50 },
      { groupMemberId: "creditor-x", displayName: "X", netMinor: 50 },
      { groupMemberId: "creditor-y", displayName: "Y", netMinor: 50 },
    ];
    const s = calculateSettlements(balances);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({
      fromGroupMemberId: "debtor-a",
      toGroupMemberId: "creditor-x",
      amountMinor: 50,
    });
    expect(s[1]).toMatchObject({
      fromGroupMemberId: "debtor-b",
      toGroupMemberId: "creditor-y",
      amountMinor: 50,
    });
  });

  test("invariant: total transferred equals total positive net", () => {
    const balances: Balance[] = [
      { groupMemberId: "a", displayName: "A", netMinor: -123 },
      { groupMemberId: "b", displayName: "B", netMinor: -77 },
      { groupMemberId: "c", displayName: "C", netMinor: 200 },
    ];
    const s = calculateSettlements(balances);
    const totalOut = s.reduce((acc, x) => acc + x.amountMinor, 0);
    const sumPositive = balances.filter((b) => b.netMinor > 0).reduce((acc, b) => acc + b.netMinor, 0);
    expect(totalOut).toBe(sumPositive);
  });
});
