import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getGroupById, getGroupMembers } from "@/lib/queries/groups";
import { getExpensesByGroupId } from "@/lib/queries/expenses";
import { formatSignedExpenseAmount } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import type { DbExpense, DbGroupMember } from "@/lib/supabase/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function memberName(members: DbGroupMember[], memberId: string): string {
  return members.find((m) => m.id === memberId)?.display_name ?? "Участник";
}

function ExpenseRow({
  expense,
  members,
}: {
  expense: DbExpense;
  members: DbGroupMember[];
}) {
  const isIncome = expense.type === "income";
  const name = memberName(members, expense.group_member_id);
  const hint = isIncome ? `${name} получил(а) деньги` : `${name} заплатил(а)`;
  const amountStr = formatSignedExpenseAmount(
    expense.amount_minor,
    expense.type
  );

  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant={isIncome ? "secondary" : "outline"}
            className="text-[0.75rem] shrink-0"
          >
            {isIncome ? "Поступление" : "Расход"}
          </Badge>
          <span className="text-[0.9375rem] font-medium truncate">
            {expense.note}
          </span>
        </div>
        <p className="text-[0.875rem] text-muted-foreground">{hint}</p>
        <p className="text-[0.875rem] text-muted-foreground">
          {formatDate(expense.expense_date)}
        </p>
      </div>
      <span
        className={[
          "text-[0.875rem] font-medium shrink-0 mt-0.5",
          isIncome ? "text-(--tg-theme-link-color,#2aabee" : "",
        ].join(" ")}
      >
        {amountStr}
      </span>
    </div>
  );
}

export default async function AllExpensesPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const session = await getSession();
  if (!session) redirect(`/groups/${groupId}`);

  const [group, members, expenses] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
    getExpensesByGroupId(groupId),
  ]);

  if (!group) redirect("/");

  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px]">
      <h1 className="text-base font-semibold">Все расходы</h1>

      <div className="mt-1 mb-4">
        <p className="text-[0.9375rem] font-medium">{group.name}</p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {expenses.length === 0
            ? "Нет операций"
            : `${expenses.length} ${pluralOps(expenses.length)}`}
        </p>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-[0.9375rem] text-muted-foreground">
            В этой группе пока нет расходов
          </p>
          <LinkButton
            href={`/groups/${groupId}/expenses/new`}
            variant="default"
          >
            Ввести первую трату
          </LinkButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((e) => (
            <ExpenseRow key={e.id} expense={e} members={members} />
          ))}
        </div>
      )}
    </main>
  );
}

function pluralOps(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "операция";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "операции";
  return "операций";
}
