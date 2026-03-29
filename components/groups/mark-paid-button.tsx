"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markSettlementPaidAction } from "@/app/actions/settlements";
import { actionErrorHint } from "@/lib/errors/user-hint";

interface MarkPaidButtonProps {
  settlementId: string;
  groupId: string;
  /** Сразу при клике (до await) — для optimistic UI списка */
  onOptimisticStart?: () => void;
}

export function MarkPaidButton({
  settlementId,
  groupId,
  onOptimisticStart,
}: MarkPaidButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    onOptimisticStart?.();
    setLoading(true);
    try {
      const result = await markSettlementPaidAction(settlementId, groupId);
      if (result.ok) {
        toast.success("Отмечено как оплаченное");
        router.refresh();
      } else {
        toast.error(actionErrorHint(result.error.code, result.error.message));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className="text-[0.8125rem] shrink-0"
    >
      {loading ? "..." : "Оплатил"}
    </Button>
  );
}
