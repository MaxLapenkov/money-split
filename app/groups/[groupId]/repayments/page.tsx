import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  fetchGroupById,
  fetchGroupMembers,
  fetchSettlementsByGroupId,
} from "@/lib/queries/cached";
import { formatMoney } from "@/lib/money";
import { LinkButton } from "@/components/ui/link-button";
import type { DbGroupMember, DbSettlement } from "@/lib/supabase/types";

function memberName(members: DbGroupMember[], memberId: string): string {
  return members.find((m) => m.id === memberId)?.display_name ?? "Участник";
}

function formatPaidAt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RepaymentRow({
  settlement,
  members,
}: {
  settlement: DbSettlement;
  members: DbGroupMember[];
}) {
  const from = memberName(members, settlement.from_group_member_id);
  const to = memberName(members, settlement.to_group_member_id);

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.9375rem] leading-snug min-w-0">
          <span className="font-medium">{from}</span>
          {" → "}
          <span className="font-medium">{to}</span>
        </p>
        <span className="text-[0.9375rem] font-medium tabular-nums shrink-0">
          {formatMoney(settlement.amount_minor)}
        </span>
      </div>
      <p className="text-[0.8125rem] text-muted-foreground">
        Отмечено оплаченным: {formatPaidAt(settlement.paid_at)}
      </p>
    </div>
  );
}

export default async function GroupRepaymentsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const session = await getSession();
  if (!session) redirect(`/groups/${groupId}`);

  const [group, members, settlements] = await Promise.all([
    fetchGroupById(groupId),
    fetchGroupMembers(groupId),
    fetchSettlementsByGroupId(groupId),
  ]);

  if (!group) redirect("/");

  const paid = settlements
    .filter((s) => s.status === "paid")
    .sort((a, b) => {
      const ta = new Date(a.paid_at ?? a.created_at).getTime();
      const tb = new Date(b.paid_at ?? b.created_at).getTime();
      return tb - ta;
    });

  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px]">
      <h1 className="text-base font-semibold">Погашения</h1>

      <div className="mt-1 mb-4">
        <p className="text-[0.9375rem] font-medium">{group.name}</p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {paid.length === 0
            ? "Пока нет отмеченных переводов"
            : `${paid.length} ${pluralPaid(paid.length)}`}
        </p>
      </div>

      {paid.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-[0.9375rem] text-muted-foreground">
            Здесь появятся переводы, отмеченные как оплаченные в блоке «Как закрыть
            все задолженности?»
          </p>
          <LinkButton href={`/groups/${groupId}`} variant="outline">
            К группе
          </LinkButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {paid.map((s) => (
            <RepaymentRow key={s.id} settlement={s} members={members} />
          ))}
        </div>
      )}
    </main>
  );
}

function pluralPaid(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "перевод";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "перевода";
  return "переводов";
}
