import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-40 rounded-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full max-w-[280px] rounded-md" />
          <Skeleton className="h-3 w-full max-w-[220px] rounded-md" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function SettlementsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-56 rounded-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function ViewersCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-48 rounded-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function GroupPageSkeleton() {
  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px] gap-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-6 w-[min(60%,12rem)] rounded-md" />
        <Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
      </div>

      <SummaryCardSkeleton />
      <SettlementsCardSkeleton />
      <ViewersCardSkeleton />

      <Skeleton className="h-11 w-full rounded-lg mt-1" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </main>
  );
}
