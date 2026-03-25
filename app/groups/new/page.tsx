import { CreateGroupForm } from "@/components/groups/create-group-form";

export default function CreateGroupPage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px] gap-4">
      <h1 className="text-base font-semibold">Создание группы</h1>
      <CreateGroupForm />
    </main>
  );
}
