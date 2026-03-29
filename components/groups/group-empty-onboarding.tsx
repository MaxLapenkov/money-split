import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import { InviteButton } from "@/components/groups/invite-button";

type Props = {
  groupId: string;
  groupName: string;
  isOwner: boolean;
};

export function GroupEmptyOnboarding({ groupId, groupName, isOwner }: Props) {
  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px] gap-4">
      <h1 className="text-base font-semibold truncate">{groupName}</h1>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="flex flex-col gap-1">
            <p className="text-[0.9375rem] font-semibold">Группа создана</p>
            <p className="text-[0.9375rem] text-muted-foreground">
              Теперь вы можете пригласить друзей или добавить первую трату
            </p>
          </div>
          <InviteButton groupId={groupId} />
        </CardContent>
      </Card>

      <LinkButton
        href={`/groups/${groupId}/expenses/new`}
        size="lg"
        className="w-full"
      >
        Ввести трату
      </LinkButton>

      {isOwner && (
        <DeleteGroupButton groupId={groupId} groupName={groupName} />
      )}
    </main>
  );
}
