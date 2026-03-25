import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  fetchBindingForUser,
  fetchGroupById,
  fetchGroupMembers,
} from "@/lib/queries/cached";
import { CreateExpenseForm } from "@/components/expenses/create-expense-form";

export default async function CreateExpensePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const session = await getSession();
  if (!session) redirect(`/groups/${groupId}`);

  const [group, members, binding] = await Promise.all([
    fetchGroupById(groupId),
    fetchGroupMembers(groupId),
    fetchBindingForUser(groupId, session.userId),
  ]);

  if (!group) redirect("/");

  const myMemberId = binding?.group_member_id ?? null;

  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px]">
      <h1 className="text-base font-semibold mb-5">Новая трата</h1>
      <CreateExpenseForm
        groupId={groupId}
        members={members}
        myMemberId={myMemberId}
      />
    </main>
  );
}
