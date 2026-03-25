"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markSettlementPaidAction } from "@/app/actions/settlements";

interface MarkPaidButtonProps {
  settlementId: string;
  groupId: string;
}

export function MarkPaidButton({ settlementId, groupId }: MarkPaidButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await markSettlementPaidAction(settlementId, groupId);
      if (result.ok) {
        toast.success("Отмечено как оплаченное");
        router.refresh();
      } else {
        toast.error("Не удалось обновить статус");
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
      {loading ? "..." : "Оплачено"}
    </Button>
  );
}
