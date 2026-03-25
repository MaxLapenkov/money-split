"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/telegram/web-app-provider";

export function CreateGroupButton() {
  const { status } = useAuth();
  const disabled = status !== "authenticated";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          buttonVariants({ size: "lg" }),
          "w-full pointer-events-none opacity-50"
        )}
      >
        Создать группу
      </span>
    );
  }

  return (
    <Link
      href="/groups/new"
      className={cn(buttonVariants({ size: "lg" }), "w-full")}
    >
      Создать группу
    </Link>
  );
}
