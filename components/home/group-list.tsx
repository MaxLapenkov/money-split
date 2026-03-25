import { LinkButton } from "@/components/ui/link-button";
import { ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getGroupsByUserId } from "@/lib/queries/groups";
import { GroupListSkeleton } from "./group-list-skeleton";

export async function GroupList() {
  const session = await getSession();

  if (!session) {
    return <GroupListSkeleton />;
  }

  const groups = await getGroupsByUserId(session.userId);

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

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <LinkButton
          key={group.id}
          href={`/groups/${group.id}`}
          variant="ghost"
          className="justify-between h-auto py-3 px-3"
        >
          <span className="text-[0.9375rem] truncate">{group.name}</span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </LinkButton>
      ))}
    </div>
  );
}
