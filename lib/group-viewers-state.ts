import type { DbGroupViewEvent } from "@/lib/supabase/types";

export type ViewersUiState = {
  viewMap: Map<string, string>;
  showAcknowledgeButton: boolean;
};

export function computeViewersState({
  viewEvents,
  userId,
}: {
  viewEvents: DbGroupViewEvent[];
  userId: string;
}): ViewersUiState {
  const viewMap = new Map(
    viewEvents.map((v) => [v.group_member_id ?? "", v.status]),
  );
  const myViewEvent = viewEvents.find((v) => v.user_id === userId);
  const showAcknowledgeButton = myViewEvent?.status === "viewed";
  return { viewMap, showAcknowledgeButton };
}
