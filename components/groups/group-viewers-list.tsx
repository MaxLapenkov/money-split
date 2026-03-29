"use client";

import { useMemo, useOptimistic, useTransition } from "react";
import type { DbGroupMember, DbGroupViewEvent } from "@/lib/supabase/types";
import {
  computeViewersState,
  type ViewersUiState,
} from "@/lib/group-viewers-state";
import { AcknowledgeGroupButton } from "@/components/groups/acknowledge-group-button";

type Props = {
  groupId: string;
  members: DbGroupMember[];
  viewEvents: DbGroupViewEvent[];
  userId: string;
  myMemberId: string;
};

export function GroupViewersList({
  groupId,
  members,
  viewEvents,
  userId,
  myMemberId,
}: Props) {
  const viewEventsKey = useMemo(
    () =>
      JSON.stringify(
        viewEvents.map((v) => [v.user_id, v.group_member_id, v.status]),
      ),
    [viewEvents],
  );

  const committedState = useMemo(
    () => computeViewersState({ viewEvents, userId }),
    [viewEventsKey, userId, viewEvents],
  );

  const [, startTransition] = useTransition();

  const [optimisticState, acknowledgeOptimistic] = useOptimistic(
    committedState,
    (current: ViewersUiState, _ack: true): ViewersUiState => {
      const nextMap = new Map(current.viewMap);
      nextMap.set(myMemberId, "acknowledged");
      return { viewMap: nextMap, showAcknowledgeButton: false };
    },
  );

  const { viewMap, showAcknowledgeButton } = optimisticState;

  return (
    <>
      {showAcknowledgeButton && (
        <AcknowledgeGroupButton
          groupId={groupId}
          onOptimisticStart={() => {
            startTransition(() => {
              acknowledgeOptimistic(true);
            });
          }}
        />
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
    </>
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
