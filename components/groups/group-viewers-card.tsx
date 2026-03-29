import type { DbGroupMember, DbGroupViewEvent } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupViewersList } from "@/components/groups/group-viewers-list";

export { computeViewersState } from "@/lib/group-viewers-state";

type Props = {
  groupId: string;
  members: DbGroupMember[];
  viewEvents: DbGroupViewEvent[];
  userId: string;
  myMemberId: string;
};

export function GroupViewersCard({
  groupId,
  members,
  viewEvents,
  userId,
  myMemberId,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[0.9375rem]">
          Кто уже просмотрел группу?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <GroupViewersList
          groupId={groupId}
          members={members}
          viewEvents={viewEvents}
          userId={userId}
          myMemberId={myMemberId}
        />
      </CardContent>
    </Card>
  );
}
