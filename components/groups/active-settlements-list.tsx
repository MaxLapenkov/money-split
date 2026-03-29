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
          {canMarkSettlementPaid(
            isOwner,
            myMemberId,
            s.from_group_member_id,
          ) ? (
            <MarkPaidButton
              settlementId={s.id}
              groupId={groupId}
              onOptimisticStart={() => {
                startTransition(() => {
                  markPaidOptimistic(s.id);
                });
              }}
            />
          ) : null}
        </div>
      ))}
    </>
  );
}
