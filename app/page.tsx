import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreateGroupButton } from "@/components/home/create-group-button";
import { GroupList } from "@/components/home/group-list";
import { GroupListSkeleton } from "@/components/home/group-list-skeleton";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px] gap-4">
      <section className="flex flex-col gap-2">
        <h1 className="text-base font-semibold">Money Split</h1>
        <p className="text-[0.9375rem] text-muted-foreground">
          Разделяйте расходы без споров
        </p>
      </section>

      <CreateGroupButton />

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-[0.9375rem] font-semibold">Мои группы</h2>
        <Suspense fallback={<GroupListSkeleton />}>
          <GroupList />
        </Suspense>
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[0.9375rem]">Зачем этот сервис?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 text-[0.8125rem] text-muted-foreground">
          <p>Быстрый расчёт долгов</p>
          <p>Прозрачные траты</p>
          <p>Удобно для поездок и ужинов</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[0.9375rem]">Как это работает?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 text-[0.8125rem] text-muted-foreground">
          <p>1. Создайте группу</p>
          <p>2. Добавляйте расходы</p>
          <p>3. Получайте &laquo;кто кому платит&raquo;</p>
        </CardContent>
      </Card>
    </main>
  );
}
