"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acknowledgeGroupAction } from "@/app/actions/view-events";

interface AcknowledgeGroupButtonProps {
  groupId: string;
  /** Сразу при клике (до await) — для optimistic UI списка */
  onOptimisticStart?: () => void;
}

export function AcknowledgeGroupButton({
  groupId,
  onOptimisticStart,
}: AcknowledgeGroupButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    onOptimisticStart?.();
    setLoading(true);
    try {
      const result = await acknowledgeGroupAction(groupId);
      if (result.ok) {
        toast.success("Вы отметились");
        router.refresh();
      } else {
        toast.error("Не удалось сохранить");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="w-full text-[0.875rem]"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Сохраняем..." : "Отметиться"}
    </Button>
  );
}
