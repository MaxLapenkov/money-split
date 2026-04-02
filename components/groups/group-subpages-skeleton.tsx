import { Skeleton } from "@/components/ui/skeleton";

function ExpenseRowSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-start justify-between gap-3">
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 shrink-0 rounded-md" />
          <Skeleton className="h-4 flex-1 max-w-[200px] rounded-md" />
        </div>
        <Skeleton className="h-3 w-48 rounded-md" />
        <Skeleton className="h-3 w-24 rounded-md" />
      </div>
      <Skeleton className="h-4 w-24 shrink-0 mt-0.5 rounded-md" />
    </div>
  );
}

export function GroupExpensesPageSkeleton() {
  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px]">
      <Skeleton className="h-6 w-36 rounded-md" />
      <div className="mt-1 mb-4 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-48 rounded-md" />
        <Skeleton className="h-3 w-28 rounded-md" />
      </div>
      <div className="flex flex-col gap-2">
        <ExpenseRowSkeleton />
        <ExpenseRowSkeleton />
        <ExpenseRowSkeleton />
        <ExpenseRowSkeleton />
      </div>
    </main>
  );
}

function RepaymentRowSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 flex-1 max-w-[220px] rounded-md" />
        <Skeleton className="h-4 w-28 shrink-0 rounded-md" />
      </div>
      <Skeleton className="h-3 w-56 rounded-md" />
    </div>
  );
}

export function GroupRepaymentsPageSkeleton() {
  return (
    <main className="flex flex-1 flex-col px-4 py-4 mx-auto w-full max-w-[640px]">
      <Skeleton className="h-6 w-32 rounded-md" />
      <div className="mt-1 mb-4 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-48 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>
      <div className="flex flex-col gap-2">
        <RepaymentRowSkeleton />
        <RepaymentRowSkeleton />
        <RepaymentRowSkeleton />
      </div>
    </main>
  );
}
