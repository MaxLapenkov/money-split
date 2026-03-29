import { LinkButton } from "@/components/ui/link-button";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import { InviteButton } from "@/components/groups/invite-button";

import type {
  DbExpense,
  DbExpenseSplit,
  DbGroupMember,
  DbGroupViewEvent,
  DbSettlement,
} from "@/lib/supabase/types";
import type { Balance } from "@/lib/settlement";
import { GroupExpenseSummaryCard } from "./group-expense-summary-card";
import { GroupSettlementsCard } from "./group-settlements-card";
import { GroupViewersCard } from "./group-viewers-card";

type Props = {
  groupId: string;
  groupName: string;
  isOwner: boolean;
  dbSettlements: DbSettlement[];
  balancesAfterPaid: Balance[];
  expenses: DbExpense[];
  splits: DbExpenseSplit[];
  members: DbGroupMember[];
  viewEvents: DbGroupViewEvent[];
  userId: string;
  myMemberId: string;
};

export function GroupDashboard({
  groupId,
  groupName,
  isOwner,
  dbSettlements,
  balancesAfterPaid,
  expenses,
  splits,
  members,
  viewEvents,
  userId,
  myMemberId,
}: Props) {
  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px] gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-base font-semibold truncate">{groupName}</h1>
        <InviteButton groupId={groupId} />
      </div>

      <GroupExpenseSummaryCard
        groupId={groupId}
        expenses={expenses}
        splits={splits}
        dbSettlements={dbSettlements}
        myMemberId={myMemberId}
        balancesAfterPaid={balancesAfterPaid}
      />

      <GroupSettlementsCard
        groupId={groupId}
        dbSettlements={dbSettlements}
        members={members}
        myMemberId={myMemberId}
        isOwner={isOwner}
      />

      <GroupViewersCard
        groupId={groupId}
        members={members}
        viewEvents={viewEvents}
        userId={userId}
        myMemberId={myMemberId}
      />

      <LinkButton
        href={`/groups/${groupId}/expenses/new`}
        size="lg"
        className="w-full mt-1"
      >
        Ввести трату
      </LinkButton>

      {isOwner && (
        <DeleteGroupButton groupId={groupId} groupName={groupName} />
      )}
    </main>
  );
}
