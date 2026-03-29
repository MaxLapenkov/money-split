import { LinkButton } from "@/components/ui/link-button";
import { ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { fetchGroupsForUser } from "@/lib/queries/cached";
import { GroupListSkeleton } from "./group-list-skeleton";

/** 5 строк по h-12 + gap-2 между ними: 5×3rem + 4×0.5rem = 17rem */
const GROUP_LIST_SCROLL_MAX_HEIGHT = "max-h-[17rem]";

export async function GroupList() {
  const session = await getSession();

  if (!session) {
    return <GroupListSkeleton />;
  }

  const groups = await fetchGroupsForUser(session.userId);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-[0.9375rem] text-muted-foreground">
          У вас пока нет групп
        </p>
        <LinkButton href="/groups/new" variant="outline" size="sm">
          Создать первую группу
        </LinkButton>
      </div>
    );
  }

  const scrollable = groups.length > 5;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        scrollable &&
          `${GROUP_LIST_SCROLL_MAX_HEIGHT} overflow-y-auto overflow-x-hidden pr-0.5 [scrollbar-gutter:stable]`,
      )}
    >
      {groups.map((group) => (
        <LinkButton
          key={group.id}
          href={`/groups/${group.id}`}
          variant="ghost"
          className="h-12 shrink-0 justify-between px-3"
        >
          <span className="text-[0.9375rem] truncate">{group.name}</span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </LinkButton>
      ))}
    </div>
  );
}
