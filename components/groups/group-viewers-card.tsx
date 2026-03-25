import type { DbGroupMember, DbGroupViewEvent } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcknowledgeGroupButton } from "@/components/groups/acknowledge-group-button";

type Props = {
  groupId: string;
  members: DbGroupMember[];
  viewEvents: DbGroupViewEvent[];
  userId: string;
  myMemberId: string;
};

export function computeViewersState({
  viewEvents,
  userId,
}: Pick<Props, "viewEvents" | "userId">) {
  const viewMap = new Map(
    viewEvents.map((v) => [v.group_member_id ?? "", v.status]),
  );
  const myViewEvent = viewEvents.find((v) => v.user_id === userId);
  const showAcknowledgeButton = myViewEvent?.status === "viewed";
  return { viewMap, showAcknowledgeButton };
}

export function GroupViewersCard({
  groupId,
  members,
  viewEvents,
  userId,
  myMemberId,
}: Props) {
  const { viewMap, showAcknowledgeButton } = computeViewersState({
    viewEvents,
    userId,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[0.9375rem]">
          Кто уже просмотрел группу?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {showAcknowledgeButton && (
          <AcknowledgeGroupButton groupId={groupId} />
        )}
        {members.map((member) => {
          const status = viewMap.get(member.id);
          return (
            <div
              key={member.id}
              className="flex items-center justify-between"
            >
              <span className="text-[0.9375rem]">{member.display_name}</span>
              <ViewStatusBadge status={status} isMe={member.id === myMemberId} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ViewStatusBadge({
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
