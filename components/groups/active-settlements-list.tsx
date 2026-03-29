"use client";

import { useOptimistic, useTransition } from "react";
import type { DbGroupMember, DbSettlement } from "@/lib/supabase/types";
import { formatMoney } from "@/lib/money";
import { MarkPaidButton } from "@/components/groups/mark-paid-button";

function canMarkSettlementPaid(
  isOwner: boolean,
  myMemberId: string,
  fromGroupMemberId: string,
) {
  return isOwner || myMemberId === fromGroupMemberId;
}

type Props = {
  groupId: string;
  /** Только suggested — с сервера */
  initialSettlements: DbSettlement[];
  members: DbGroupMember[];
  myMemberId: string;
  isOwner: boolean;
};

export function ActiveSettlementsList({
  groupId,
  initialSettlements,
  members,
  myMemberId,
  isOwner,
}: Props) {
  const [, startTransition] = useTransition();

  const [optimisticSettlements, markPaidOptimistic] = useOptimistic(
    initialSettlements,
    (current, settledId: string) =>
      current.filter((s) => s.id !== settledId),
  );

  const memberMap = new Map(members.map((m) => [m.id, m.display_name]));

  if (optimisticSettlements.length === 0) {
    return (
      <p className="text-[0.9375rem] text-muted-foreground">
        Все расчёты закрыты
      </p>
    );
  }

  return (
    <>
      {optimisticSettlements.map((s) => (
        <div
          key={s.id}
          className="flex gap-3 items-center"
        >
          <div className="min-w-0 flex-1 flex flex-col gap-0.5 text-[0.9375rem] leading-snug text-foreground">
            <div>
              <span className="font-medium">
                {memberMap.get(s.from_group_member_id) ?? "—"}
              </span>{" "}
              должен(а){" "}
              <span className="font-medium">
                {memberMap.get(s.to_group_member_id) ?? "—"}
              </span>
            </div>
            <div className="tabular-nums">{formatMoney(s.amount_minor)}</div>
          </div>
          {canMarkSettlementPaid(
            isOwner,
            myMemberId,
            s.from_group_member_id,
          ) ? (
            <div className="shrink-0">
              <MarkPaidButton
                settlementId={s.id}
                groupId={groupId}
                onOptimisticStart={() => {
                  startTransition(() => {
                    markPaidOptimistic(s.id);
                  });
                }}
              />
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
}
