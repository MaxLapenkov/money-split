"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app/error:", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8 mx-auto w-full max-w-[640px] min-h-[40vh]">
      <p className="text-[0.9375rem] text-center text-muted-foreground">
        Что-то пошло не так. Попробуйте ещё раз или вернитесь назад.
      </p>
      <Button type="button" onClick={() => reset()}>
        Повторить
      </Button>
    </main>
  );
}
