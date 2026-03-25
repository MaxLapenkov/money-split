import type { DbGroupMember, DbSettlement } from "@/lib/supabase/types";
import { formatMoney } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkPaidButton } from "@/components/groups/mark-paid-button";

type Props = {
  groupId: string;
  dbSettlements: DbSettlement[];
  members: DbGroupMember[];
};

export function GroupSettlementsCard({ groupId, dbSettlements, members }: Props) {
  const activeSettlements = dbSettlements.filter(
    (s) => s.status === "suggested",
  );
  const memberMap = new Map(members.map((m) => [m.id, m.display_name]));

  return (
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
      </CardContent>
    </Card>
  );
}
