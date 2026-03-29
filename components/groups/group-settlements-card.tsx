import type { DbGroupMember, DbSettlement } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActiveSettlementsList } from "@/components/groups/active-settlements-list";

type Props = {
  groupId: string;
  dbSettlements: DbSettlement[];
  members: DbGroupMember[];
  /** Текущий пользователь (участник) */
  myMemberId: string;
  /** Создатель группы (организатор) */
  isOwner: boolean;
};

export function GroupSettlementsCard({
  groupId,
  dbSettlements,
  members,
  myMemberId,
  isOwner,
}: Props) {
  const activeSettlements = dbSettlements.filter(
    (s) => s.status === "suggested",
  );

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
          <ActiveSettlementsList
            groupId={groupId}
            initialSettlements={activeSettlements}
            members={members}
            myMemberId={myMemberId}
            isOwner={isOwner}
          />
        )}
      </CardContent>
    </Card>
  );
}
