import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  fetchBindingForUser,
  fetchExpensesByGroupId,
  fetchGroupById,
  fetchGroupMembers,
  fetchSettlementsByGroupId,
  fetchSplitsByGroupId,
  fetchViewEventsForGroup,
} from "@/lib/queries/cached";
import { resolveGroupSettlementsDisplay } from "@/lib/groups/resolve-group-settlements-display";
import { recordInitialGroupView } from "@/lib/queries/view-events";
import { BindParticipantForm } from "@/components/groups/bind-participant-form";
import { GroupDashboard } from "@/components/groups/group-dashboard";
import { GroupEmptyOnboarding } from "@/components/groups/group-empty-onboarding";

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
    fetchGroupById(groupId),
    fetchGroupMembers(groupId),
  ]);

  if (!group) {
    redirect("/");
  }

  const binding = await fetchBindingForUser(groupId, session.userId);

  const isOwner = group.created_by === session.userId;

  if (!binding) {
    return (
      <BindParticipantForm
        groupId={groupId}
        groupName={group.name}
        members={members}
        isOwner={isOwner}
      />
    );
  }

  const myMemberId = binding.group_member_id;

  await recordInitialGroupView({
    groupId,
    userId: session.userId,
    groupMemberId: myMemberId,
  });

  const [expenses, splits, viewEvents, settlementsSnapshot] =
    await Promise.all([
      fetchExpensesByGroupId(groupId),
      fetchSplitsByGroupId(groupId),
      fetchViewEventsForGroup(groupId),
      fetchSettlementsByGroupId(groupId),
    ]);

  if (expenses.length === 0) {
    return (
      <GroupEmptyOnboarding
        groupId={groupId}
        groupName={group.name}
        isOwner={isOwner}
      />
    );
  }

  const { dbSettlements, balancesAfterPaid } =
    await resolveGroupSettlementsDisplay({
      groupId,
      currency: group.currency,
      members,
      expenses,
      splits,
      settlementsSnapshot,
    });

  return (
    <GroupDashboard
      groupId={groupId}
      groupName={group.name}
      isOwner={isOwner}
      dbSettlements={dbSettlements}
      balancesAfterPaid={balancesAfterPaid}
      expenses={expenses}
      splits={splits}
      members={members}
      viewEvents={viewEvents}
      userId={session.userId}
      myMemberId={myMemberId}
    />
  );
}
