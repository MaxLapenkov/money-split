import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getGroupById, getGroupMembers } from "@/lib/queries/groups";
import { getBindingForUser } from "@/lib/queries/bindings";
import {
  getExpensesByGroupId,
  getSplitsByGroupId,
} from "@/lib/queries/expenses";
import { getSettlementsByGroupId } from "@/lib/queries/settlements";
import { getViewEventsForGroup } from "@/lib/queries/view-events";
import { calculateBalances, calculateSettlements } from "@/lib/settlement";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LinkButton } from "@/components/ui/link-button";
import { InviteButton } from "@/components/groups/invite-button";
import { BindParticipantForm } from "@/components/groups/bind-participant-form";
import { MarkPaidButton } from "@/components/groups/mark-paid-button";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const [group, members] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
  ]);

  if (!group) {
    redirect("/");
  }

  // Check binding — if none, show participant selection
  const binding = await getBindingForUser(groupId, session.userId);

  if (!binding) {
    return (
      <BindParticipantForm
        groupId={groupId}
        groupName={group.name}
        members={members}
      />
    );
  }

  const myMemberId = binding.group_member_id;

  const [expenses, splits, dbSettlements, viewEvents] = await Promise.all([
    getExpensesByGroupId(groupId),
    getSplitsByGroupId(groupId),
    getSettlementsByGroupId(groupId),
    getViewEventsForGroup(groupId),
  ]);

  const hasExpenses = expenses.length > 0;

  if (!hasExpenses) {
    // State A: onboarding
    return (
      <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px] gap-4">
        <h1 className="text-base font-semibold truncate">{group.name}</h1>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-4">
            <div className="flex flex-col gap-1">
              <p className="text-[0.9375rem] font-semibold">Группа создана</p>
              <p className="text-[0.9375rem] text-muted-foreground">
                Теперь вы можете пригласить друзей или добавить первую трату
              </p>
            </div>
            <InviteButton groupId={groupId} />
          </CardContent>
        </Card>

        <LinkButton
          href={`/groups/${groupId}/expenses/new`}
          size="lg"
          className="w-full"
        >
          Ввести трату
        </LinkButton>
      </main>
    );
  }

  // State B: expenses exist
  const balances = calculateBalances(members, expenses, splits);
  const suggestions = calculateSettlements(balances);

  const myBalance = balances.find((b) => b.groupMemberId === myMemberId);
  const totalSpent = expenses
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount_minor, 0);

  const myPaid = expenses
    .filter((e) => e.type === "expense" && e.group_member_id === myMemberId)
    .reduce((s, e) => s + e.amount_minor, 0);

  const mySplitTotal = splits
    .filter((s) => s.group_member_id === myMemberId)
    .reduce((s, sp) => s + sp.amount_minor, 0);

  const owedToMe = Math.max(0, myBalance?.netMinor ?? 0);

  const activeSettlements = dbSettlements.filter(
    (s) => s.status === "suggested",
  );

  const memberMap = new Map(members.map((m) => [m.id, m.display_name]));
  const viewMap = new Map(
    viewEvents.map((v) => [v.group_member_id ?? "", v.status]),
  );

  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px] gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-base font-semibold truncate">{group.name}</h1>
        <InviteButton groupId={groupId} />
      </div>

      {/* Обзор затрат */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[0.9375rem]">Обзор затрат</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Row label="Всего потрачено всеми" value={formatMoney(totalSpent)} />
          <Separator />
          <Row label="Ваша доля" value={formatMoney(mySplitTotal)} />
          <Row label="Вы оплатили" value={formatMoney(myPaid)} />
          <Row label="Вам задолжали" value={formatMoney(owedToMe)} />
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

      {/* Как закрыть задолженности */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[0.9375rem]">
            Как закрыть все задолженности?
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activeSettlements.length === 0 ? (
            <p className="text-[0.9375rem] text-muted-foreground">
              Все расчёты закрыты
            </p>
          ) : (
            activeSettlements.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2"
              >
                <p className="text-[0.9375rem] leading-snug">
                  <span className="font-medium">
                    {memberMap.get(s.from_group_member_id) ?? "—"}
                  </span>{" "}
                  переводит{" "}
                  <span className="font-medium">
                    {formatMoney(s.amount_minor)}
                  </span>{" "}
                  →{" "}
                  <span className="font-medium">
                    {memberMap.get(s.to_group_member_id) ?? "—"}
                  </span>
                </p>
                <MarkPaidButton settlementId={s.id} groupId={groupId} />
              </div>
            ))
          )}

          {suggestions.length > 0 && activeSettlements.length === 0 && (
            <p className="text-[0.8125rem] text-muted-foreground">
              Расчёты пересчитаются после новых трат
            </p>
          )}
        </CardContent>
      </Card>

      {/* Кто просмотрел */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[0.9375rem]">
            Кто уже просмотрел группу?
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {members.map((member) => {
            const status = viewMap.get(member.id);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <span className="text-[0.9375rem]">{member.display_name}</span>
                <StatusBadge status={status} isMe={member.id === myMemberId} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <LinkButton
        href={`/groups/${groupId}/expenses/new`}
        size="lg"
        className="w-full mt-1"
      >
        Ввести трату
      </LinkButton>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[0.9375rem] text-muted-foreground">{label}</span>
      <span className="text-[0.9375rem] font-medium tabular-nums">{value}</span>
    </div>
  );
}

function StatusBadge({
  status,
  isMe,
}: {
  status: string | undefined;
  isMe: boolean;
}) {
  if (!status) {
    return (
      <span className="text-[0.8125rem] text-muted-foreground">
        не просмотрено
      </span>
    );
  }
  if (status === "acknowledged") {
    return (
      <span className="text-[0.8125rem] text-primary font-medium">
        отметился{isMe ? " (вы)" : ""}
      </span>
    );
  }
  return (
    <span className="text-[0.8125rem] text-muted-foreground">
      просмотрено{isMe ? " (вы)" : ""}
    </span>
  );
}
