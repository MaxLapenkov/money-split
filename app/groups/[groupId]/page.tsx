export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px]">
      <h1 className="text-base font-semibold">Группа</h1>
      <p className="text-[0.9375rem] text-muted-foreground mt-2">
        ID: {groupId}
      </p>
    </main>
  );
}
