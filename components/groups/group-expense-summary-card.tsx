import type {
  DbExpense,
  DbExpenseSplit,
  DbSettlement,
} from "@/lib/supabase/types";
import type { Balance } from "@/lib/settlement";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LinkButton } from "@/components/ui/link-button";

export type GroupExpenseSummaryInput = {
  expenses: DbExpense[];
  splits: DbExpenseSplit[];
  dbSettlements: DbSettlement[];
  myMemberId: string;
  balancesAfterPaid: Balance[];
};

export function computeExpenseSummary({
  expenses,
  splits,
  dbSettlements,
  myMemberId,
  balancesAfterPaid,
}: GroupExpenseSummaryInput) {
  const myBalanceAfterPaid = balancesAfterPaid.find(
    (b) => b.groupMemberId === myMemberId,
  );
  const totalSpent = expenses
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount_minor, 0);

  const myPaidFromExpenses = expenses
    .filter((e) => e.type === "expense" && e.group_member_id === myMemberId)
    .reduce((s, e) => s + e.amount_minor, 0);

  const paidSettlements = dbSettlements.filter((st) => st.status === "paid");

  const myPaidAsDebtor = paidSettlements
    .filter((st) => st.from_group_member_id === myMemberId)
    .reduce((s, st) => s + Number(st.amount_minor), 0);

  const myReceivedDebtPayments = paidSettlements
    .filter((st) => st.to_group_member_id === myMemberId)
    .reduce((s, st) => s + Number(st.amount_minor), 0);

  const myPaid = Math.max(
    0,
    myPaidFromExpenses + myPaidAsDebtor - myReceivedDebtPayments,
  );

  const mySplitTotal = splits
    .filter((s) => s.group_member_id === myMemberId)
    .reduce((s, sp) => s + sp.amount_minor, 0);

  const owedToMe = Math.max(0, myBalanceAfterPaid?.netMinor ?? 0);

  return {
    totalSpent,
    mySplitTotal,
    myPaid,
    owedToMe,
  };
}

type CardProps = GroupExpenseSummaryInput & { groupId: string };

export function GroupExpenseSummaryCard(props: CardProps) {
  const { groupId, ...input } = props;
  const { totalSpent, mySplitTotal, myPaid, owedToMe } =
    computeExpenseSummary(input);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[0.9375rem]">Обзор затрат</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <SummaryRow
          label="Всего потрачено всеми"
          value={formatMoney(totalSpent)}
        />
        <Separator />
        <SummaryRow label="Ваша доля" value={formatMoney(mySplitTotal)} />
        <SummaryRow label="Вы оплатили" value={formatMoney(myPaid)} />
        <SummaryRow label="Вам задолжали" value={formatMoney(owedToMe)} />
        <Separator />
        <LinkButton
          href={`/groups/${groupId}/expenses`}
          variant="ghost"
          className="justify-start px-0 text-[0.875rem] text-primary h-auto"
        >
          Посмотреть все расходы →
        </LinkButton>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[0.9375rem] text-muted-foreground">{label}</span>
      <span className="text-[0.9375rem] font-medium tabular-nums">{value}</span>
    </div>
  );
}
